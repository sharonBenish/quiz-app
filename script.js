const username = document.querySelector("#name input");
const div = document.querySelector("#name > div");
const spinner = document.getElementById("spinner");
const form = document.querySelector("#name form");
const quiz = document.getElementById("quiz-app");
const playBtn = document.getElementById("play");
const namePage = document.getElementById("name");
const progressBar = document.querySelector(".progress");
const questionNum = document.querySelector(".question-num");
const questionDiv = document.querySelector(".question");
const options = document.getElementById("options");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const resultPage = document.getElementById("result");
const displayResult = resultPage.querySelector(".display-container");
const leaderboard = resultPage.querySelector(".leaderboard > div");
const retryPage = document.getElementById("retry")

const highScores = JSON.parse(localStorage.getItem('leaderBoard')) || [];

let questions=[];
let answers=[];
let score = 0;
const maxQuestions = 10;
let currQuestion = 0;
var user;

form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(username.value.trim() == ""){
        return
    }
    user = username.value;
    div.style.display ="none";
    spinner.style.display ="block";
    loadQuiz();
})

async function loadQuiz(){
    try{
        const res = await fetch("https://opentdb.com/api.php?amount=10&category=9&type=multiple");
        const json = await res.json();
        const data = json.results;
        console.log(data);
        questions = data.map(i=> {
            return {
                question: i.question,
                options:shuffle([...i.incorrect_answers, i.correct_answer]),
                correct:i.correct_answer,
            }
        })
        console.log(questions);
        if(res){
            spinner.style.display ="none";
        }
        quizHTML();
        namePage.style.display ="none";
        quiz.style.display="flex";
    } catch(e){
        namePage.style.display="none";
        retry.style.display="flex";
    }      
}

function shuffle(arr){
    //Fisher-Yates algorithm
    let i = arr.length;
    while(--i > 0){
        let randIndex = Math.floor(Math.random() * (i + 1));
        [arr[randIndex], arr[i]] = [arr[i], arr[randIndex]];
    }
    return arr;
}

function quizHTML(){
    if (currQuestion > 0){
        prevBtn.style.display = "block"
    }else{
        prevBtn.style.display = "none"
    }
    if(currQuestion >=(maxQuestions -1 )){
        nextBtn.innerHTML = "SUBMIT";
        nextBtn.classList.add("submit");
    }else{
       nextBtn.innerHTML = "Next &gt;";
       nextBtn.classList.remove("submit");
    }
    
    const currentQuiz = questions[currQuestion];
    currQuestion ++;
    progressBar.style.width = `${(currQuestion/ maxQuestions) * 100}%`;
    questionNum.innerHTML = `Question ${currQuestion}/${maxQuestions}`;
    questionDiv.innerHTML = currentQuiz.question;
    const option = currentQuiz.options.map(option=>{
        return`<div class="option" id="${currentQuiz.options.indexOf(option)}" data-ans="${Number(option === currentQuiz.correct)}"><span>${(currentQuiz.options.indexOf(option) + 10).toString(36).toUpperCase()}</span>${option}</div>`
    });
    options.innerHTML= option.join("");

    //Enables you see previously selected answers
    if (answers.some(x=> + x.q === currQuestion)){
        const chosen = answers[answers.findIndex(x=> + x.q == currQuestion)].id;
        document.getElementById(chosen).classList.add("selected")
    }
}

quiz.addEventListener("click", (e)=>{
    const key = e.target;
    if (key.classList.contains("option")){
       const optionDivs = [...quiz.querySelectorAll(".option")];
       optionDivs.forEach(div =>{
        div.classList.remove("selected");
       })
       key.classList.add("selected");
       updateAns(key);
       console.log(answers);
    }

    if (key.id == "next"){
        
        if (currQuestion >= maxQuestions){
            score = answers.map(x => x.a).reduce((a,b)=> a+b, 0);
            const userScore = {
                name:user,
                score:score,
            }
            highScores.push(userScore);
            highScores.sort((a, b) => a.score > b.score? -1: 1);
            highScores.splice(5);
            localStorage.setItem('leaderBoard', JSON.stringify(highScores));
            console.log(highScores);
            showResult(userScore);
            return
        }
        quizHTML()
    }
    if (key.id == "prev"){
        if (currQuestion <= 1){
            return;
        }
        currQuestion = currQuestion -2;
        quizHTML();
    }
})

function updateAns(key){
    if (answers.some(x=> + x.q === currQuestion)){
        const idx = answers.findIndex(x => + x.q === currQuestion);
        answers[idx].a = + key.dataset.ans;
        answers[idx].id=key.id;
    } else{
        answers.push({
            q:currQuestion,
            a: + key.dataset.ans,
            id:key.id
        })
    }
}

function showResult(userScore){
    displayResult.querySelector(".congrats_msg").innerHTML = `Congrats ${userScore.name} !!!`;
    displayResult.querySelector(".msg").innerHTML = `You scored ${userScore.score} out of ${maxQuestions} questions`;
    const details = highScores.map(x => {
        return `<div class="details"><span><span class="index">${highScores.indexOf(x) + 1}</span>${x.name}</span> <span class="score">${x.score}</span></div>`
    });
    leaderboard.innerHTML = details.join("");
    quiz.classList.add("hide");
    resultPage.style.display="block";
}