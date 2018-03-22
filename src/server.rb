# Final Project: Design Patterns Quiz App
# Date: 23-November-2017
# Authors: A01374040 Andrea Iram Molina Orozco
#          A01360477 Diego Trujillo Norberto
# File: server.rb

# ============================= REQUIRES
require 'sinatra'
require 'models/schema'
require 'json'
require 'pp'

# ============================= CONSTANTS


# ============================= CONFIRUGRATION
set :port, ENV['PORT'] || 8080
set :bind, ENV['IP'] || '0.0.0.0'

# ============================= API

get '/api/quizzes' do
  content_type :json
  Quiz.to_json
end

get '/api/quiz/:id' do
  content_type :json
  Quiz[params['id']].to_json(:include=> {:questions=> {:include=>:options}})
end

post '/api/quiz' do
  request.body.rewind
  body = JSON.parse request.body.read

  quiz = Quiz.create(guest_name: body["guest_name"], grade: 0)
  question_number = Integer(body["question_number"])
  
  question_ids = UtilityFunctions.generate_question_list(question_number)
  quiz.populate(question_ids)

  content_type :json
  quiz.to_json(:include=>{:questions=> {:include=>:options}})
end

put '/api/quiz/:id' do
  request.body.rewind
  body = JSON.parse request.body.read
  
  quiz = Quiz[params["id"]]
  quiz.update(grade: body["grade"])
  
  content_type :json
  quiz.to_json(:include=> {:questions=> {:include=>:options}})
end

get '/api/questions' do
  content_type  :json
  Question.to_json(:include=>:options)
end

get '/api/question/:id' do
  content_type :json
  Question[params['id']].to_json(:include=>:options)
end

# ============================= FRONTEND
get '/' do
  send_file File.join(settings.public_folder, 'app.html')
end


# ============================= UTILITY FUNCTIONS
class UtilityFunctions
  @@rng = Random.new
  
  # Generates a list of unique question_id's for creating a new Quiz.
  def self.generate_question_list(question_number)
    # Initialize empty list
    used_question_ids = []
    # Add as many questions as given argument
    1.upto(question_number) do |index|
      # Get a random question id
      new_question_id = @@rng.rand(1..Question.count)
      # Ensures no repeated questions are added to the new quiz.
      while used_question_ids.include? new_question_id do
        new_question_id = @@rng.rand(1..Question.count)
      end 
      # When number is unique, push to list
      used_question_ids.push(new_question_id)
    end
    # Return question ids
    used_question_ids
  end
  
end
