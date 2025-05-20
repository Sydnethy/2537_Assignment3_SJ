let clickCount = 0;
let matches = 0;
let totalPairs = 0;
let timer;
let timeLimit = 60;
let powerUpUsed = false;
let allPokemon = [];
let boardLocked = false;
let firstCard = null;
let secondCard = null;

$(document).ready(() => {
    $("#startBtn").on("click", startGame);
    $("#resetBtn").on("click", resetGame);
    $("#powerUpBtn").on("click", activatePowerUp);
    $("#theme").on("change", toggleTheme);

    fetchAllPokemon();
});

async function fetchAllPokemon() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500");
    const data = await res.json();
    allPokemon = data.results;
}

function startGame() {
    const difficulty = $("#difficulty").val();
    if (difficulty === "easy") {
        totalPairs = 3;
        timeLimit = 30;
    } else if (difficulty === "medium") {
        totalPairs = 6;
        timeLimit = 60;
    } else {
        totalPairs = 10;
        timeLimit = 90;
    }

    clickCount = 0;
    matches = 0;
    powerUpUsed = false;
    boardLocked = false;
    firstCard = null;
    secondCard = null;

    clearInterval(timer);
    $("#game_grid").empty();

    $("#game_grid").removeClass("grid-easy grid-medium grid-hard");

    // Set layout and rules based on difficulty
    if (difficulty === "easy") {
        totalPairs = 3;
        timeLimit = 30;
        $("#game_grid").addClass("grid-easy");
    } else if (difficulty === "medium") {
        totalPairs = 6;
        timeLimit = 60;
        $("#game_grid").addClass("grid-medium");
    } else {
        totalPairs = 10;
        timeLimit = 90;
        $("#game_grid").addClass("grid-hard");
    }

    updateStatus();
    generateCards();
    startTimer();
}

async function generateCards() {
    const gameGrid = $("#game_grid").empty();
    const selectedImages = [];

    let attempts = 0;

    while (selectedImages.length < totalPairs * 2 && attempts < 300) {
        const randomIndex = Math.floor(Math.random() * allPokemon.length);
        const pokemon = allPokemon[randomIndex];
        const res = await fetch(pokemon.url);
        const data = await res.json();
        const img = data.sprites.other["official-artwork"].front_shiny; // default or shiny

        if (img && !selectedImages.includes(img)) {
            selectedImages.push(img, img); // push pair
        }

        attempts++;
    }

    if (attempts >= 300) {
        alert(
            "Could not load enough unique Pokémon with images. Please try again."
        );
        return;
    }

    // Shuffle cards
    selectedImages.sort(() => 0.5 - Math.random());

    // Render to DOM
    selectedImages.forEach((imgSrc, index) => {
        const id = `img${index}`;
        gameGrid.append(`
            <div class="card">
                <img id="${id}" class="front_face" src="${imgSrc}">
                <img class="back_face" src="images/back.webp">
            </div>
    `);
    });

    setupCardLogic();
    updateStatus();
}

function setupCardLogic() {
    $(".card").on("click", function () {
        if (
            $(this).hasClass("matched") ||
            $(this).hasClass("flip") ||
            boardLocked
        )
            return;

        $(this).addClass("flip");
        const front = $(this).find(".front_face")[0];

        if (!firstCard) {
            firstCard = front;
        } else {
            secondCard = front;
            clickCount++;
            boardLocked = true;

            if (firstCard.src === secondCard.src) {
                $(firstCard).parent().addClass("matched").off("click");
                $(secondCard).parent().addClass("matched").off("click");
                matches++;
                resetSelection();
            } else {
                setTimeout(() => {
                    $(firstCard).parent().removeClass("flip");
                    $(secondCard).parent().removeClass("flip");
                    resetSelection();
                }, 1000);
            }

            updateStatus();
            checkWin();
        }
    });
}

function resetSelection() {
    firstCard = null;
    secondCard = null;
    boardLocked = false;
}

function updateStatus() {
    $("#clicks").text(`Clicks: ${clickCount}`);
    $("#pairs").text(`Pairs: ${matches} / ${totalPairs}`);
}

function startTimer() {
    let timeLeft = timeLimit;
    $("#time").text(`Time: ${timeLeft}s`);

    timer = setInterval(() => {
        timeLeft--;
        $("#time").text(`Time: ${timeLeft}s`);

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up! Game Over.");
            $(".card").off("click");
        }
    }, 1000);
}

function checkWin() {
    if (matches === totalPairs) {
        clearInterval(timer);
        alert("You matched all pairs! You win!");
        $(".card").off("click");
    }
}

function resetGame() {
    clearInterval(timer);
    $("#game_grid").empty();
    $("#clicks").text("Clicks: 0");
    $("#pairs").text("Pairs: 0 / 0");
    $("#time").text("Time: 0s");
    clickCount = 0;
    matches = 0;
    totalPairs = 0;
    boardLocked = false;
    powerUpUsed = false;
    firstCard = null;
    secondCard = null;

    $("#game_grid").removeClass("grid-easy grid-medium grid-hard");
}

function toggleTheme() {
    const theme = $("#theme").val();
    $("body").removeClass().addClass(theme);
}

function activatePowerUp() {
    if (powerUpUsed) return;

    powerUpUsed = true;
    $(".card").addClass("flip");

    setTimeout(() => {
        $(".card").not(".matched").removeClass("flip");
    }, 3000);
}

