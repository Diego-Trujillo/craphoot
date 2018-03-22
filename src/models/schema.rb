# Final Project: Design Patterns Quiz App
# Date: 23-November-2017
# Authors: A01374040 Andrea Iram Molina Orozco
#          A01360477 Diego Trujillo Norberto
# File: schema.rb

# ============================= REQUIRES
require 'sequel'

# ============================= CONFIGURATION
Sequel::Model.plugin :json_serializer

# ============================= SCHEMA DEFINITION
DB = Sequel.sqlite

DB.create_table? :questions do
  primary_key :id
  String :content, null: false
end

DB.create_table? :options do
  primary_key :id
  String :content, null: false
  TrueClass :is_right_answer
  foreign_key :question_id, :questions, :null=>false

end

DB.create_table? :quizzes do
  primary_key :id
  String :guest_name
  Float :grade
end

DB.create_table? :questions_quizzes do
  foreign_key :question_id, :questions, key: :id
  foreign_key :quiz_id, :quizzes, key: :id
  primary_key [:question_id, :quiz_id]
  index [:quiz_id]
end



# ============================= MODEL DEFINITION
# Models a quiz question
class Question < Sequel::Model
  one_to_many :options
  many_to_many :quizzes
  plugin :eager_each
end

# Models a question option
class Option < Sequel::Model
  many_to_one :question
end

# Models a quiz
class Quiz < Sequel::Model
  many_to_many :questions
  
  # Fill the quiz with questions given as ids in parameters
  def populate(question_ids)
    question_ids.each do |question_id|
      self.add_question(Question[question_id])
    end
  end
  
end

#class Answer < Sequel::Model
#  many_to_one :quiz
#  many_to_one :question
#end

# ============================= DATABASE POPULATION
q1 = Question.create(content: "	Design pattern which defines a one to many dependency, so if one of the objects changes its state the related objects are notified")
q1.add_option(content: "Observer", is_right_answer: true)
q1.add_option(content: "Singleton", is_right_answer: false)
q1.add_option(content: "Builder", is_right_answer: false)

q2 = Question.create(content: "	A framework is an Architectural style in which most of the work is already done")
q2.add_option(content: "True", is_right_answer: true)
q2.add_option(content: "False", is_right_answer: false)

q3 = Question.create(content: "This architectural style considers the components as blocks, is also described as a hierarchy of layers")
q3.add_option(content: "Pipe and filter architecture", is_right_answer: false)
q3.add_option(content: "client/server architecture", is_right_answer: false)
q3.add_option(content: "Layered architecture", is_right_answer: true)

q4 = Question.create(content: "This architectural style works with the logical flow of sequential modules, at the start is usual to have a data generator and at the end is a data sink")
q4.add_option(content: "client/server architecture", is_right_answer: false)
q4.add_option(content: "Pipe and filter architecture ", is_right_answer: true)
q4.add_option(content: "Frameworks ", is_right_answer: false)

q5 = Question.create(content: "The client/server architecture works separating the functionalities in three parts, the server, the filter, and the client")
q5.add_option(content: "True", is_right_answer: false)
q5.add_option(content: "False", is_right_answer: true)

q6 = Question.create(content: "The component-Based architecture is an architectural style which focuses in assembling a centralized control whit many coordinated components")
q6.add_option(content: "True", is_right_answer: false)
q6.add_option(content: "False", is_right_answer: true)

q7 = Question.create(content: "The conceptual view shows the major parts of the system and the interconnections")
q7.add_option(content: "True", is_right_answer: true)
q7.add_option(content: "False", is_right_answer: false)

q8 = Question.create(content: "The implementation view is seen in terms of a non-real implementation, this means is only considered as a conceptual design")
q8.add_option(content: "True", is_right_answer: false)
q8.add_option(content: "False", is_right_answer: true)

q9 = Question.create(content: "This view is designed to show the dynamic structures, in terms of tasks and processes, is usually used when the concurrency is high")
q9.add_option(content: "Process view", is_right_answer: true)
q9.add_option(content: "Conceptual view ", is_right_answer: false)
q9.add_option(content: "Deployment view ", is_right_answer: false)

q10= Question.create(content: "This view is used to show the allocation of task to physical nodes")
q10.add_option(content: "Process view ", is_right_answer: false)
q10.add_option(content: "Conceptual view ", is_right_answer: false)
q10.add_option(content: "Deployment view ", is_right_answer: true)

q11 = Question.create(content: "The design pattern which defines a family of algorithms, encapsulates each one and make them interchangeable")
q11.add_option(content: "Mediator", is_right_answer: false)
q11.add_option(content: "Strategy", is_right_answer: true)
q11.add_option(content: "Singleton", is_right_answer: false)

q12 = Question.create(content: "One of the most relevant advantages of the strategy pattern is that you have the code and the context merged making easier the usage of the code")
q12.add_option(content: "True", is_right_answer: false)
q12.add_option(content: "False", is_right_answer: true)

q13 = Question.create(content: "Unpredictability is one of the prime drivers of the software complexity")
q13.add_option(content: "True", is_right_answer: true)
q13.add_option(content: "False", is_right_answer: false)

q14 = Question.create(content: "It is a technique used in software engineering which consists in change the intern structure to make it more understandable without changing the external functionality ")
q14.add_option(content: "Refactoring", is_right_answer: true)
q14.add_option(content: "Code construction ", is_right_answer: false)
q14.add_option(content: "Method Reconstruction ", is_right_answer: false)

q15 = Question.create(content: "The duplicated code, long methods and large classes are some of the “Bad smells in the code”")
q15.add_option(content: "True", is_right_answer: true)
q15.add_option(content: "False", is_right_answer: false)

q16 = Question.create(content: "Two hats is the name given to the action of adding functionality while refactoring code")
q16.add_option(content: "True", is_right_answer: true)
q16.add_option(content: "False", is_right_answer: false)

q17 = Question.create(content: "Design pattern which provides the facility of access and aggregate elements ")
q17.add_option(content: "Observer", is_right_answer: false)
q17.add_option(content: "Proxy ", is_right_answer: false)
q17.add_option(content: "iterator ", is_right_answer: true)

q18 = Question.create(content: "The composite pattern composes objects into tree structures. This includes a common interface or base class for the objects, one or more leaf classes and a higher-level class built from subcomponents")
q18.add_option(content: "True", is_right_answer: true)
q18.add_option(content: "False", is_right_answer: false)

q19 = Question.create(content: "This pattern is used to encapsulate request or instructions as objects")
q19.add_option(content: "Adapter", is_right_answer: false)
q19.add_option(content: "Proxy", is_right_answer: false)
q19.add_option(content: "Command ", is_right_answer: true)

q20 = Question.create(content: "Those are the iterator kinds")
q20.add_option(content: "Default & Customized ", is_right_answer: false)
q20.add_option(content: "Internal & External ", is_right_answer: false)
q20.add_option(content: "Explicit & Implicit  ", is_right_answer: true)

q21 = Question.create(content: "The template method is used when you want to merge all the functionalities in a single class without having inheritance")
q21.add_option(content: "True", is_right_answer: false)
q21.add_option(content: "False", is_right_answer: true)

q22 = Question.create(content: "In the template method you should separate the things that remain the same and group them in one class")
q22.add_option(content: "True", is_right_answer: true)
q22.add_option(content: "False", is_right_answer: false)

q23 = Question.create(content: "Writing tests with the objective of not debugging the code is one of the goals of the refactoring")
q23.add_option(content: "True", is_right_answer: false)
q23.add_option(content: "False", is_right_answer: true)

q24 = Question.create(content: "The adapter pattern is used to increase functionalities in a structured way ")
q24.add_option(content: "True", is_right_answer: false)
q24.add_option(content: "False", is_right_answer: true)

q25 = Question.create(content: "The adapter pattern helps the classes to work together, making them compatibles")
q25.add_option(content: "True", is_right_answer: true)
q25.add_option(content: "False", is_right_answer: false)

q26 = Question.create(content: "Pattern used to surrogate or placeholder for another object to control access to another")
q26.add_option(content: "Strategy", is_right_answer: false)
q26.add_option(content: "Builder", is_right_answer: false)
q26.add_option(content: "Proxy", is_right_answer: true)


q27 = Question.create(content: "Pattern used to increase responsibilities dynamically to an object")
q27.add_option(content: "Decorator", is_right_answer: true)
q27.add_option(content: "Composite", is_right_answer: false)
q27.add_option(content: "Singleton", is_right_answer: false)

q28 = Question.create(content: "The SOLID principles are used to implement best practices, the “O” in the acronym means Open/Closed principle ")
q28.add_option(content: "True", is_right_answer: true)
q28.add_option(content: "False", is_right_answer: false)

q29 = Question.create(content: "The SOLID principles are used to implement best practices, the “I” in the acronym means Inheritance principle ")
q29.add_option(content: "True", is_right_answer: false)
q29.add_option(content: "False", is_right_answer: true)

q30 = Question.create(content: "The 4+1 view model includes the logical view, process view and Layered view")
q30.add_option(content: "True", is_right_answer: false)
q30.add_option(content: "False", is_right_answer: true)

q31 = Question.create(content: "This pattern ensures that a class has only one instance and provide a global access to it")
q31.add_option(content: "Observer", is_right_answer: false)
q31.add_option(content: "Adapter", is_right_answer: false)
q31.add_option(content: "Singleton", is_right_answer: true)

q32 = Question.create(content: "The abstract factory provides an interface to communicate non-related objects")
q32.add_option(content: "True", is_right_answer: false)
q32.add_option(content: "False", is_right_answer: true)

q33 = Question.create(content: "The prototype pattern separates the construction of a complex object, so the same process can create different representations ")
q33.add_option(content: "True", is_right_answer: false)
q33.add_option(content: "False", is_right_answer: true)

q34 = Question.create(content: "With a given language this design pattern defines a representation for the grammar")
q34.add_option(content: "Observer", is_right_answer: false)
q34.add_option(content: "Interpreter", is_right_answer: true)
q34.add_option(content: "Strategy", is_right_answer: false)
q34.add_option(content: "Adapter", is_right_answer: false)

q35 = Question.create(content: "The model-view-controller architecture is a style which is developed as a suite of a lot of small services")
q35.add_option(content: "True", is_right_answer: false)
q35.add_option(content: "False", is_right_answer: true)

q36 = Question.create(content: "This design pattern seeks to decrease the number of decisions developers need to make")
q36.add_option(content: "Decorator", is_right_answer: false)
q36.add_option(content: "MetaProgramming", is_right_answer: false)
q36.add_option(content: "Convetion over configuration ", is_right_answer: true)

q37 = Question.create(content: "The domain-specific language focuses in giving a convenient syntax for expressing a problem")
q37.add_option(content: "True", is_right_answer: true)
q37.add_option(content: "False", is_right_answer: false)

q38 = Question.create(content: "This pattern consists of writing computer programs that write other computer programs")
q38.add_option(content: "Interpreter", is_right_answer: false)
q38.add_option(content: "Metaprogramming", is_right_answer: true)
q38.add_option(content: "Recursive programming ", is_right_answer: false)
q38.add_option(content: "All of them", is_right_answer: false)

q39 = Question.create(content: "Anticipate needs is a principle that should be used when implementing the convention over configuration pattern")
q39.add_option(content: "True", is_right_answer: true)
q39.add_option(content: "False", is_right_answer: false)

q40 = Question.create(content: "Only talk to your immediate friends is a principle that should be used when implementing the convention over configuration pattern")
q40.add_option(content: "True", is_right_answer: false)
q40.add_option(content: "False", is_right_answer: true)

# ============================= END
puts '== Schema defined and populated succesfully!'