/*global $*/
/*global swal*/

// ========================================================================================= CONSTANTS
var DEFAULT_GUEST_NAME = "Guest";
var DEFAULT_QUESTION_NUMBER = 5;

// ========================================================================================= VARIABLES
var app = null;

// ========================================================================================= LOCAL MODELS

// ================================================================================ QUIZ
// Local model of a quiz.
class Quiz{
  // Constructor
  constructor(data){
    
    this.id = data.id;
    this.guestName = data.guest_name;
    
    this.grade = data.grade;
    this.correctQuestions = 0;
    
    this.questions = [];
    
    var qs = this.questions;
    data.questions.forEach(function(questionData, index){
      qs.push(new Question(questionData, index));
    });
    
    
  }
  
  // Computes the number of correct answers and the grade
  computeGrade(){
    var cq = 0;
    
    this.questions.forEach(function(question, index, questions){
      if(question.isUserAnswerCorrect) { cq++; }
    });
    this.correctQuestions = cq;
    
    this.grade = (this.correctQuestions / this.questions.length) * 10;
    return this.grade;
  }
}


// ================================================================================ QUESTION
// Local model of a question
class Question{
  // Constructor
  constructor(data, index){
    this.id = data.id;
    this.content = data.content;
    this.index = index;
    this.options = data.options;
    this.isUserAnswerCorrect = null;
  }
  // Checks if user answer is correct and saves result
  answer(selectedOptionID){
    var selectedOption = this.options.filter(function(option){
      return option.id == selectedOptionID;
    })[0];
    
    this.isUserAnswerCorrect = selectedOption.is_right_answer;
    return this.isUserAnswerCorrect;
  }
  // Gets the correct answer for the question.
  getCorrectOption(){
    return this.options.filter(function(option){
        return option.is_right_answer == true;
      })[0];
  }
}

// ========================================================================================= CONTROLLERS

// ================================================================================ PROTOTYPE
class Controller{
  // Constructor
  constructor(){
    this.parentSelector = null
    this.inputSelectors = {};
    this.elementSelectors = {};
  }
  
  // Animate entry
  animateEntry(){}
  
  // Animate exit
  animateExir(cb){}
}

// ================================================================================ APP
// Controller orchestrator and manager. Executes business logic and 
class App{
  // Constructuror
  constructor(){
    this.quiz = null;
    
    this.loaderController = new LoaderController();
    this.landingController = new LandingController();
    this.quizController = null;
    this.resultsController = null;
  }
  
  // Transition from loader to landing view.
  start(){
    // Animate exit from loader and show and animate landing.
    var lc = this.landingController;
    this.loaderController.animateExit(function(){
      lc.animateEntry();
    });
  }
  
  // Start a new quiz; Transition from landing view to quiz view.
  startNewQuiz(){
    // Get input from landing controller
    var quizInfo = this.landingController.getQuizInfo();
    this.landingController.setQuizInfo(quizInfo);
    
    // Validate that user inputs a number of questions that is no less than 0 or no more than 10.
    if(quizInfo.questionNumber < 1){
      ModalFactory.launchError('Hey there!', 'You can\'t have a quiz with no questions, right?');
      return; 
    }
    else if(quizInfo.questionNumber > 10){
      ModalFactory.launchError('Hey there!', 'Somebody told us we can\'t give you more than 10 questions per quiz. Sorry, bucko!');
      return;
    }    
    
    // JSON containing the data required for POSTing the new quiz.
    var data = {guest_name: quizInfo.guestName, question_number: quizInfo.questionNumber};
    
    // POST the new quiz and handle responses
    $.ajax({
      type: 'POST',
      url: '/api/quiz',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: function(response){
        app.quiz = new Quiz(response);
        app.quizController = new QuizController(app.quiz);
        app.landingController.animateExit(function(){ app.quizController.showQuestion(); })
      },
      failure: ModalFactory.launchGenericError
    });
  }
  
  // Handle user click of an answer. Calls the function on the corresponding controller.
  selectAnswer(optionID, selectedButtonSelector){
    this.quizController.selectAnswer(optionID, selectedButtonSelector);
  }
  
  // Handle user click of the 'Next' button. Calls the function on the corresponding controller.
  nextQuestion(){
    if(this.quizController.currentQuestionIndex == this.quiz.questions.length - 1){
      this.showResults();
    }
    else{
      this.quizController.nextQuestion();
    }
  }
  
  // Show the results of the quiz. Transitions from quiz view to results view upon saving the quiz grade server-side.
  showResults(){
    this.quiz.computeGrade();
    console.log(this.quiz.grade)
    $.ajax({
      type: 'PUT',
      url: '/api/quiz/' + app.quiz.id,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({grade: app.quiz.grade}),
      success: function(response){
        app.resultsController = new ResultsController(app.quiz);
        app.quizController.animateExit(function(){
          app.resultsController.showResults();
        });
      },
      failure: ModalFactory.launchGenericError
    });
  }
  
  // Resets the app after completion. Transitions from results view back to landing view.
  reset(){
    var lc = this.landingController;
    this.resultsController.animateExit(function(){
      lc.animateEntry();
    });
  }
}

// ================================================================================ LOADER

// Controler for the loader spinner at app initialization.
class LoaderController{
  // Constructor
  constructor(){
    this.parentSelector = $("#loader");
  }
  
  // Hides view elements and animates their exit. Calls a callback function upon exit.
  animateExit(cb){
    var ps = this.parentSelector;
    this.parentSelector.animateCSS('zoomOut', function(){
      ps.children().hide();
      ps.hide();
      cb();
    });
  }

}

// ================================================================================ LANDING
// Controller for landing page for starting a new quiz.
class LandingController{
  // Constructor
  constructor(){
    // Parent selector
    this.parentSelector = $("#index");
    // Static elements selectors
    this.elementSelectors = {
      ctaSelector: $("#pg-index-cta"),
      cardSelector: $("#pg-index-card")
    };
    
    // Input selectors
    this.inputSelectors = {
      guestNameSelector: $("#guest_name"),
      questionNumberSelector: $("#question_number")
    };
    
    // Fill in input data if a quiz has been taken
    this.setQuizInfo(this.inputSelectors.guestNameSelector.val(), this.inputSelectors.questionNumberSelector.val());
    
  }
  
  // Return view quiz info
  getQuizInfo(){
    return {guestName: this.inputSelectors.guestNameSelector.val() || DEFAULT_GUEST_NAME, questionNumber: this.inputSelectors.questionNumberSelector.val() || DEFAULT_QUESTION_NUMBER};
  }
  
  // Set view quiz info
  setQuizInfo(info){
    this.inputSelectors.guestNameSelector.val(info.guestName);
    this.inputSelectors.questionNumberSelector.val(info.questionNumber);
  }
  
  // Shows view elements and animates their entry
  animateEntry(){
    this.parentSelector.show();
    this.parentSelector.children().show();
    this.parentSelector.animateCSS('bounceInUp');
  }
  
  // Hides view elements and animates their exit. Calls a callback function upon exit.
  animateExit(cb){
    this.elementSelectors.ctaSelector.animateCSS('bounceOutLeft');
    var ps = this.parentSelector;
    this.elementSelectors.cardSelector.animateCSS('bounceOutRight', function(){
      ps.children().hide();
      ps.hide();
      
      cb();
    });
  }
}

// ================================================================================ QUIZ
class QuizController{
  constructor(quiz){
    // Quiz 'model'
    this.quiz = quiz;
    // Parent Selector
    this.parentSelector = $("#quiz");
    
    // Input selectors
    this.inputSelectors = {
      answerButtonPrototype: function(){ return $(".btn-answer"); } ,
      nextButton: $("#pg-quiz-next_button")
    };
    
    // Element selectors
    this.elementSelectors = {
      questionNumber: $("#pg-quiz-question_number"),
      questionContent: $("#pg-quiz-question_content"),
      questionOptionsParent: $("#pg-quiz-question_options"),
      questionResult: $("#pg-quiz-question_result"),
      nextQuestion: $("#pg-quiz-next_button")
    };
    
    // Control variables
    this.answeringLocked = false;
    this.currentQuestionIndex = 0;
  }
  
  // Logic to fill in question view card with question being answered.
  showQuestion(){
    // Point to the current question
    this.currentQuestion = this.quiz.questions[this.currentQuestionIndex];
    
    // Fill in question details
    // -- Question number
    this.elementSelectors.questionNumber.html("Question " + (this.currentQuestion.index + 1) + " of " + this.quiz.questions.length);
    
    // -- Question content
    this.elementSelectors.questionContent.html(this.currentQuestion.content);
    
    // -- Question options
    // ----- Clear previous options
    this.elementSelectors.questionOptionsParent.empty();
    
    // ---- Fill in with question options
    var esQop = this.elementSelectors.questionOptionsParent;
    this.currentQuestion.options.forEach(function(option){
      var optionButton = `
        <div class="col-xs-12 col-md-6 btn-answer-wrapper">
          <button type="button" class="btn btn-fill btn-info btn-block btn-answer" onclick="app.selectAnswer(` +  option.id + `, this); return false;">
            ` + option.content + `
          </button>
        </div>
      `;
      esQop.append(optionButton);
    });
    
    // ---- Unlock answer buttons
    this.inputSelectors.answerButtonPrototype().prop("disabled", false)
    this.answeringLocked = false;
    
    // -- Clear answer results
    this.elementSelectors.questionResult.empty();
    
    // Lock 'Next button'
    this.inputSelectors.nextButton.prop("disabled", true);
    
    // Show and animate card
    this.animateEntry();
  }
  
  // Logic to handle user answering a the current question.
  selectAnswer(optionID, selectedButtonSelector){
    // If user has already answered, further action won't be allowed.
    if(this.answeringLocked) return;
    // Lock answering
    this.answeringLocked = true;

    // Locks answer buttons except the one being answered
    this.inputSelectors.answerButtonPrototype().prop('disabled', true);
    $(selectedButtonSelector).prop('disabled', false);
    
    // Checks if answer given was correct
    this.currentQuestion.answer(optionID);
    
    // Shows correct answer
    this.showQuestionResult()
    
    // Unlocks the next button
    this.inputSelectors.nextButton.prop("disabled", false);
  }
  
  // Shows a text depending on correctness of answer.
  showQuestionResult(){
      if(this.currentQuestion.isUserAnswerCorrect){ this.elementSelectors.questionResult.html('<span style="color:green">&#x2705; Awesome! Your answer was spot on.</span>'); }
      else{ this.elementSelectors.questionResult.html('<span style="color:red">&#x274C; Nah. The right answer is: '+ this.currentQuestion.getCorrectOption().content +'</span>'); }
  }
  
  
  // Shows next question
  nextQuestion(){
    // Moves current question to the next question
    this.currentQuestionIndex++;
    
    // Hide current question and show next question.
    var self = this;
    this.animateExit(function(){
      // Show new question
      self.showQuestion();
    });
    
  }
  
  // Show and animate question
  animateEntry(){
    this.parentSelector.show();
    this.parentSelector.children().show();
    this.parentSelector.animateCSS('bounceInUp');
  }
  
  // Hides view elements and animates their exit. Calls a callback function upon exit.
  animateExit(cb){
    var ps = this.parentSelector;
    this.parentSelector.animateCSS('bounceOutDown', function(){
      ps.children().hide();
      ps.hide();
      
      cb();
    });
  }
}

// ================================================================================ RESULTS
// Controller for showing the results of the quiz.
class ResultsController {
  // Constructor
  constructor(quiz){
    // Quiz 'model'
    this.quiz = quiz;
    
    // Parent Selector
    this.parentSelector = $("#results");
    // Input selectors
    this.inputSelectors = { };
    
    // Element selectors
    this.elementSelectors = { 
      guestName: $('#pg-results-guest_name'),
      resultsSentence: $('#pg-results-results_sentence'),
      resultsComment: $('#pg-results-results_comment')
    };
  }
  
  // Show the quiz results on the view card
  showResults(){
    // Fill in result details
    // -- Guest name
    this.elementSelectors.guestName.html(this.quiz.guestName);
    // -- Result sentence
    this.elementSelectors.resultsSentence.html('You got ' + this.quiz.correctQuestions + ' out of ' + this.quiz.questions.length + ' questions right.')
    // -- Additional comments
    this.elementSelectors.resultsComment.html(this.getResultComment());
    
    // Animate entry 
    this.animateEntry();
  }
  
  // Gets a comment depending on grade
  getResultComment(){
    var grade = this.quiz.grade;
    if(grade < 2.5){ return '<span class="text-danger">Come on, you can do better than that. &#128544; </span>'}
    else if(grade >= 2.5 && grade < 5){ return '<span class="text-warning">Getting there, step up your pattern game! &#128526;</span>'}
    else if(grade >= 5 && grade < 7.5){ return '<span class="text-info">You\'re practically there. Strive for perfection, my dear. &#58378;</span>'}
    else if(grade >= 7.5){ return '<span class="text-success">You da boss. &#128079; &#128079;</span>'}
    else { return "WAIT, WHAT?"; }
  }
  
  // Show and animate results pane
  animateEntry(){
    this.parentSelector.show();
    this.parentSelector.children().show();
    this.parentSelector.animateCSS('zoomIn');
  }
  
  // Hides view elements and animates their exit. Calls a callback function upon exit.
  animateExit(cb){
    
    var ps = this.parentSelector;
    this.parentSelector.animateCSS('bounceOutDown', function(){
      ps.children().hide();
      ps.hide();
      
      cb();
    });
  }
  
}


// ========================================================================================= ON LOAD
$().ready(function(){
  //transitionToIndex();
  app = new App();
  app.start();
});

// ========================================================================================= HELPERS
$.fn.extend({
    animateCSS: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if (callback) {
              callback();
            }
        });
        return this;
    }
});

// Returns a random item from the array
Array.prototype.randomItem = function () {
    return this[ Math.floor(Math.random() * this.length) ]
}














class ModalFactory{
  
  // Launches a SWAL modal conatining a title, type and message provided by the user.
  static launch(options){
    swal({
      title: options.title,
      confirmButtonClass: 'btn btn-success btn-fill',
      confirmButtonText: options.confirmationMessage,
      buttonsStyling: false,
      html: options.message,
      type: options.type
    });
  }
  
  // Launches a SWAL dialog error containing a given error message
  static launchError(title, message){
    ModalFactory.launch({
      title: title,
      message: message,
      confirmationMessage: 'Ok! I get it.',
      type:'warning'
    });
  }
  // Launches a SWAL dialog error containing a generic error message
  static launchGenericError(){
    ModalFactory.launchError('Oops!','Something went wrong. Try quizzing sometime later. We\'ll try to fix this one');
  }
  
  // Launches a SWAL dialog error containing information about the project.
  static launchAbout(){
    ModalFactory.launch({
      title: 'About Craphoot!',
      confirmationMessage: 'Wow. Awesome, thanks.',
      message: `
        <p>  
          <br />
          All questions were taken from or inspired by 
          <a href="https://www.amazon.com.mx/Design-Patterns-Ruby-Russ-Olsen/dp/0321490452"> Olsen </a> and 
          <a href="http://webcem01.cem.itesm.mx:8005/apps/s201713/"> Ortiz </a>!
          <br />
          Truly, they are the real MVP.
        </p>
        <h5 class="font-size:0.75em;">
          <small>
            Developed by:
            <br/>
            Andrea Iram Molina Orozco <small>A01374040</small>
            <br/>
            Diego Trujillo Norberto <small>A01360477</small>
          </small>
        </h5>

        <br />
      `,
    type: 'info'});
  }
}
