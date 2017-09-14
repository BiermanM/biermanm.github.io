// loading screen
$(window).on('load', function() {
    $("#loading").fadeOut(500);
});

// general functions

// Use user agent to check if browser is on a mobile device or tablet
window.isMobileOrTablet = function() {
    var check = false;
    (function(a){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
            check = true;
    })(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
function print2dArray(arr) {
    var str = "";
    for (var i = 0; i < arr[0].length; i++)
    {
        str += "[ ";
        for (var j = 0; j < arr.length; j++)
        {
            if (j == arr.length - 1)
                str += arr[j][i] + " ";
            else
                str += arr[j][i] + ", ";
        }
        str += "]\n";
    }
    console.log(str);
}
function clone(arr) {
    var xCoordCells = arr.length;
    var yCoordCells = arr[0].length;                

    var newArr = new Array(xCoordCells);
    for (var i = 0; i < xCoordCells; i++)
    {
        newArr[i] = new Array(yCoordCells);
        for (var j = 0; j < yCoordCells; j++)
            newArr[i][j] = arr[i][j];
    }

    return newArr;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// functions for the canvas
async function run(cells, ms) {
    var currWindowHeight = $(window).height();
    var currWindowWidth = $(window).width();
    var prevWindowHeight = currWindowHeight;
    var prevWindowWidth = currWindowWidth;

    // while the window size doesn't change while the game is running
    while (currWindowHeight == prevWindowHeight && currWindowWidth == prevWindowWidth)
    {
        await sleep(ms);
        cells = step(gridSize, cells);
        drawAllCells(canvas, gridSize, cells);

        prevWindowHeight = currWindowHeight;
        prevWindowWidth = currWindowWidth;
        currWindowHeight = $(window).height();
        currWindowWidth = $(window).width();
    }
}
function setCanvasGrid(canvas, gridSize, addHeight) {
    // if on a mobile device or tablet
    if (window.isMobileOrTablet() == true) {
        canvas.height = 0;
        canvas.width = 0;
        $("#footer").css("background-color", "transparent");

        $("body").height($(window).height() + addHeight);
        $("body").width($(window).width());
    }
    // if not on a mobile device or tablet
    else {
        canvas.height = $(window).height();
        canvas.width = $(window).width();

        $("body").height(canvas.height + addHeight);
        $("body").width(canvas.width);

        if (canvas.getContext)
        {
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#222222";

            for (var i = 1; i <= Math.floor(canvas.width / gridSize); i++)
                ctx.fillRect((gridSize * i) - 1, 0, 2, canvas.height);

            for (var i = 1; i <= Math.floor(canvas.height / gridSize); i++)
                ctx.fillRect(0, (gridSize * i) - 1, canvas.width, 2);
        }
    }
}
function drawCell(canvas, x, y, gridSize, cellColor) {
    if (canvas.getContext)
    {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = cellColor;

        // cell at (0, 0)
        if (x == 0 && y == 0)
        {
            ctx.clearRect(x, y, gridSize - 1, gridSize - 1);
            ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
        }

        // first row
        else if (y == 0)
        {
            ctx.clearRect((x * gridSize) + 1, (y * gridSize), gridSize - 2, gridSize - 1);
            ctx.fillRect((x * gridSize) + 1, (y * gridSize), gridSize - 2, gridSize - 1);
        }

        // first column
        else if (x == 0)
        {
            ctx.clearRect((x * gridSize), (y * gridSize) + 1, gridSize - 1, gridSize - 2);
            ctx.fillRect((x * gridSize), (y * gridSize) + 1, gridSize - 1, gridSize - 2);
        }

        // all other cells
        else
        {
            ctx.clearRect((x * gridSize) + 1, (y * gridSize) + 1, gridSize - 2, gridSize - 2);
            ctx.fillRect((x * gridSize) + 1, (y * gridSize) + 1, gridSize - 2, gridSize - 2);
        }
    }
}
function drawAllCells(canvas, gridSize, cells) {
    for (var i = 0; i < cells.length; i++)
    {
        for (var j = 0; j < cells[0].length; j++)
        {
            if (cells[i][j] == 0)
                drawCell(canvas, i, j, gridSize, "#222222");
            else
                drawCell(canvas, i, j, gridSize, "rgba(0, 0, 0, " + (Math.random() * 0.5) + ")");
        }
    }
}
function initialState(canvas, gridSize) {
    // Get maximum number of cells for rows and columns
    var xCoordCells = Math.ceil(canvas.width / gridSize);
    var yCoordCells = Math.ceil(canvas.height / gridSize);

    // Create 2D array for cells
    var cells = new Array(xCoordCells);
    for (var i = 0; i < xCoordCells; i++)
    {
        cells[i] = new Array(yCoordCells);
        for (var j = 0; j < yCoordCells; j++)
        {
            if (Math.random() < 0.5)
                cells[i][j] = 0;
            else
                cells[i][j] = 1;
        }
    }           

    // Draw cells at their initial state
    for (var i = 0; i < xCoordCells; i++) {
        for (var j = 0; j < yCoordCells; j++)
        {
            if (cells[i][j] == 0)
                drawCell(canvas, i, j, gridSize, 'black');
            else
                drawCell(canvas, i, j, gridSize, 'transparent');
        }
    }

    return cells;
}
function step(gridSize, cells) {
    var nextGeneration = clone(cells);

    // for every cell in the grid
    for (var i = 0; i < cells.length; i++)
    {
        for (var j = 0; j < cells[0].length; j++)
        {
            var liveNeighbors = 0;

            // create 3x3 array for neighboring cells
            var neighborCells = new Array(3);
            for (var k = 0; k < 3; k++)
            {
                neighborCells[k] = new Array(3);
                for (var l = 0; l < 3; l++)
                    neighborCells[k][l] = -1;
            }

            // center is the cell itself
            neighborCells[1][1] = "*";

            // if no cells exist on its left
            if (i == 0)
            {
                neighborCells[0][0] = "N";
                neighborCells[1][0] = "N";
                neighborCells[2][0] = "N";
            }

            // if no cells exist above it
            if (j == 0)
            {
                neighborCells[0][0] = "N";
                neighborCells[0][1] = "N";
                neighborCells[0][2] = "N";
            }

            // if no cells exist on its right
            if (i == cells.length - 1)
            {
                neighborCells[0][2] = "N";
                neighborCells[1][2] = "N";
                neighborCells[2][2] = "N";
            }

            // if no cells exist below it
            if (j == cells[0].length - 1)
            {
                neighborCells[2][0] = "N";
                neighborCells[2][1] = "N";
                neighborCells[2][2] = "N";
            }

            // check if neighboring cells are occupied
            for (var k = 0; k < 3; k++)
            {
                for (var l = 0; l < 3; l++)
                {
                    // if neighbor is out-of-bounds, wrap around to the opposite side of the grid
                    if (neighborCells[k][l] == "N")
                    {
                        // top left
                        if ((k == 0) && (l == 0) && (cells[((i - 1) == -1) ? (cells.length - 1) : (i - 1)][((j - 1) == -1) ? (cells[0].length - 1) : (j - 1)] != 0))
                                liveNeighbors++;
                        // center left
                        else if ((k == 1) && (l == 0) && (cells[((i - 1) == -1) ? (cells.length - 1) : (i - 1)][j] != 0))
                                liveNeighbors++;
                        // bottom left
                        else if ((k == 2) && (l == 0) && (cells[((i - 1) == -1) ? (cells.length - 1) : (i - 1)][((j + 1) == cells[0].length) ? 0 : (j + 1)] != 0))
                                liveNeighbors++;
                        // top middle
                        else if ((k == 0) && (l == 1) && (cells[i][((j - 1) == -1) ? (cells[0].length - 1) : (j - 1)] != 0))
                                liveNeighbors++;
                        // bottom middle
                        else if ((k == 2) && (l == 1) && (cells[i][((j + 1) == cells[0].length) ? 0 : (j + 1)] != 0))
                                liveNeighbors++;
                        // top right
                        else if ((k == 0) && (l == 2) && (cells[((i + 1) == cells.length) ? 0 : (i + 1)][((j - 1) == -1) ? (cells[0].length - 1) : (j - 1)] != 0))
                                liveNeighbors++;
                        // center right
                        else if ((k == 1) && (l == 2) && (cells[((i + 1) == cells.length) ? 0 : (i + 1)][j] != 0))
                                liveNeighbors++;
                        // bottom right
                        else if ((k == 2) && (l == 2) && (cells[((i + 1) == cells.length) ? 0 : (i + 1)][((j + 1) == cells[0].length) ? 0 : (j + 1)] != 0))
                                liveNeighbors++;
                    }
                    // if not itself, which is at (1, 1)
                    else if (neighborCells[k][l] != "*")
                    {
                        // top left
                        if ((k == 0) && (l == 0) && (cells[i - 1][j - 1] != 0))
                            liveNeighbors++;
                        // center left
                        else if ((k == 1) && (l == 0) && (cells[i - 1][j] != 0))
                            liveNeighbors++;
                        // bottom left
                        else if ((k == 2) && (l == 0) && (cells[i - 1][j + 1] != 0))
                            liveNeighbors++;
                        // top middle
                        else if ((k == 0) && (l == 1) && (cells[i][j - 1] != 0))
                            liveNeighbors++;
                        // bottom middle
                        else if ((k == 2) && (l == 1) && (cells[i][j + 1] != 0))
                            liveNeighbors++;
                        // top right
                        else if ((k == 0) && (l == 2) && (cells[i + 1][j - 1] != 0))
                            liveNeighbors++;
                        // center right
                        else if ((k == 1) && (l == 2) && (cells[i + 1][j] != 0))
                            liveNeighbors++;
                        // bottom right
                        else if ((k == 2) && (l == 2) && (cells[i + 1][j + 1] != 0))
                            liveNeighbors++;
                    }
                }
            }

            // any dead cell with exactly three live neighbours becomes a live cell
            if (cells[i][j] == 0 && liveNeighbors == 3)
                nextGeneration[i][j] = 1;

            // any live cell with two or three live neighbours stays alive, any live cell with fewer than two live neighbours or more than three live neighbours dies
            else if (cells[i][j] == 1 && (liveNeighbors < 2 || liveNeighbors > 3))
                nextGeneration[i][j] = 0;
        }
    }

    return nextGeneration;
}

// functions for the background
function setBackgroundColor() {
    var windowHeight = $(window).height();
    if ($(this).scrollTop() >= 0 && $(this).scrollTop() < windowHeight * 0.5)
        $("#background").css("background-color", "#7f3737");
    else if ($(this).scrollTop() >= windowHeight * 0.5 && $(this).scrollTop() < windowHeight)
        $("#background").css("background-color", "#66377f");
    else if ($(this).scrollTop() >= windowHeight && $(this).scrollTop() < windowHeight * 1.5)
        $("#background").css("background-color", "#535353");
    else if ($(this).scrollTop() >= windowHeight * 1.5 && $(this).scrollTop() < windowHeight * 2)
        $("#background").css("background-color", "#377f77");
    else if ($(this).scrollTop() >= windowHeight * 2)
        $("#background").css("background-color", "#375a7f");
}
function setBackgroundSize() {
    $("#background").height($(window).outerHeight());
    $("#background").width($(window).width());
}
$(document).ready(function() {
    setBackgroundSize();
    setBackgroundColor();
});
$(function changeColor() {
    $(window).scroll(function() {
        setBackgroundColor();
    });
});

// functions for the pages
function setAboutMePage() {
    $("#aboutMe").css("padding-left", $(window).width() * 0.1);
    $("#aboutMe").css("padding-right", $(window).width() * 0.1);
    $("#aboutMe").css("padding-top", $(window).height() * 0.1);
    $("#aboutMe").css("padding-bottom", $(window).height() * 0.1);
    $("#aboutMe").width($(window).width() * 0.8);
    $("#aboutMe").height($(window).height() * 0.8);

    // sets the font size of the page's title based on the window's width
    if ($(window).width() <= 1000)
        $("#aboutMeTitle").css("font-size", "32px");
    else if ($(window).width() <= 1300)
        $("#aboutMeTitle").css("font-size", "49px");
    else if ($(window).width() <= 1600)
        $("#aboutMeTitle").css("font-size", "66px");
    else if ($(window).width() <= 1900)
        $("#aboutMeTitle").css("font-size", "83px");
    else
        $("#aboutMeTitle").css("font-size", "100px");

    $("#bio").css("padding", "20px");
    $("#aboutMeMainText").height($("#aboutMe").height() - $("#aboutMeTitle").height() - $("#aboutMeBtn").height());

    // sets the width & height of the profile picture as 25% of the height of the text box or 33% of the width of the text box, whichever is less
    var profileWH = 0;
    if (($("#aboutMeMainText").width() / 3) < ($("#aboutMeMainText").height() / 4))
        profileWH = Math.ceil($("#aboutMeMainText").width() / 3);
    else
        profileWH = Math.ceil($("#aboutMeMainText").height() / 3);

    $("#profile").width(profileWH + "px");
    $("#profile").height(profileWH + "px");                

    // set correct sizing for "sent email" alert
    $(".alert").css("margin-left", $(window).width() * 0.1);
    $(".alert").css("margin-right", $(window).width() * 0.1);
    $(".alert").css("margin-top", $(window).height() * 0.1);
    $(".alert").css("margin-bottom", $(window).height() * 0.1);

    if (Math.abs($("#aboutMe").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) > 10)
    {
        $(".alert").css("margin-left", (parseFloat($(".alert").css("margin-left")) + (($("#aboutMe").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) / 2)) + "px");
        $(".alert").css("margin-right", (parseFloat($(".alert").css("margin-right")) + (($("#aboutMe").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) / 2)) + "px");
    }
}
function setMainPage() {
    var h = $(window).height();
    $("#main").width($(window).width());
    $("#main").height(h);

    $("#linkToAbout").css("padding-top", h * 0.02);
    $("#linkToAbout").height(h * 0.08);
    $("#aboutLinkText").css("margin-left", (($("#linkToPortfolio").width() - $("#aboutLinkText").width()) / 2) );
    $("#aboutLinkText").css("margin-right", (($("#linkToPortfolio").width() - $("#aboutLinkText").width()) / 2) );

    $("#name").height(h * 0.4);
    if ($(window).width() > 1000)
    {
        $("#name").css("margin-top", h * 0.2);
        $("#name").css("margin-bottom", h * 0.2);
    }
    else
    {
        $("#name").css("margin-top", h * 0.25);
        $("#name").css("margin-bottom", h * 0.15);
    }

    $("#linkToPortfolio").height(h * 0.08);
    $("#linkToPortfolio").css("padding-bottom", h * 0.02);
    $("#portfolioLinkText").css("margin-left", (($("#linkToPortfolio").width() - $("#portfolioLinkText").width()) / 2) );
    $("#portfolioLinkText").css("margin-right", (($("#linkToPortfolio").width() - $("#portfolioLinkText").width()) / 2) );

    if ($(window).width() > 500)
        $("#name").css("font-size", ($(window).width() * 0.1) + "px");
    else
        $("#name").css("font-size", ($(window).width() * 0.1) + "px");

    $("#resumeBtn").css("font-size", $("#contactFormBtn").css("font-size"));
}
function setPortfolioPage() {
    $("#portfolio").css("padding-left", $(window).width() * 0.05);
    $("#portfolio").css("padding-right", $(window).width() * 0.05);
    $("#portfolio").css("padding-top", $(window).height() * 0.1);
    $("#portfolio").css("padding-bottom", $(window).height() * 0.1);
    $("#portfolio").width($(window).width() * 0.9);

    $(".project").each(function() {
        if ($(window).width() < 576)
            $(this).height($(this).width() / 2);
        else
            $(this).height($(this).width());
    });

    if ($("#portfolio").height() < ($(window).height() * 0.8))
        $("#portfolio").height($(window).height() * 0.8);

    $("#portfolioTitle").css("font-size", $("#aboutMeTitle").css("font-size"));
}
function setModalImageSizes() {
    var innerW = 0;
    var multiplier = 0;

    if ($("#modal-homeVR").find(".carousel-inner").width() != 100) {
        innerW = $("#modal-homeVR").find(".carousel-inner").width();
        multiplier = 334 / 695;
    }
    else if ($("#modal-alaska").find(".carousel-inner").width() != 100) {
        innerW = $("#modal-alaska").find(".carousel-inner").width();
        multiplier = 0.75;
    }
    else if ($("#modal-california").find(".carousel-inner").width() != 100) {
        innerW = $("#modal-california").find(".carousel-inner").width();
        multiplier = 0.75;
    }
    else if ($("#modal-nevada").find(".carousel-inner").width() != 100) {
        innerW = $("#modal-nevada").find(".carousel-inner").width();
        multiplier = 0.75;
    }
    else if ($("#modal-canada").find(".carousel-inner").width() != 100) {
        innerW = $("#modal-canada").find(".carousel-inner").width();
        multiplier = 0.75;
    }

    $(".img-fluid").each(function() {
        $(this).width(innerW);
        $(this).height(innerW * multiplier);
    });

    if ($("#sketchfab-sfr").width() != 100) {
        $("#sketchfab-sfr").width($("#modal-sciFiRevolver").find(".modal-body").width());
        $("#sketchfab-sfr").height($("#modal-sciFiRevolver").find(".modal-body").width() * 0.75);
    }
    else if ($("#sketchfab-h").width() != 100) {
        $("#sketchfab-h").width($("#modal-house").find(".modal-body").width());
        $("#sketchfab-h").height($("#modal-house").find(".modal-body").width() * 0.75);
    }
    else if ($("#sketchfab-hu").width() != 100) {
        $("#sketchfab-hu").width($("#modal-houseUntextured").find(".modal-body").width());
        $("#sketchfab-hu").height($("#modal-houseUntextured").find(".modal-body").width() * 0.75);
    }
    else if ($("#sketchfab-pg").width() != 100) {
        $("#sketchfab-pg").width($("#modal-powerGenerator").find(".modal-body").width());
        $("#sketchfab-pg").height($("#modal-powerGenerator").find(".modal-body").width() * 0.75);
    }
}

setAboutMePage();
setMainPage();
setPortfolioPage();
setModalImageSizes();

var gridSize = 50; // in pixels
var stepDelay = 400; // in milliseconds
var canvas = document.getElementById("gameOfLife");

setCanvasGrid(canvas, gridSize, 1000);
var cells = initialState(canvas, gridSize);
run(cells, stepDelay);

// Portfolio gallery
var mixer = mixitup($("#portfolioContainer"));

// Enable hover for text on project when project tile is hovered over
$(".project").hover(function () {
    // for when hover begins
    $(this).children('.projectTitle').css("transition", "0.5s");
    $(this).children('.projectTitle').css("opacity", 1);

    $(this).children('img').css("transition", "0.5s");
    $(this).children('img').css("opacity", 0.3);

}, function () {
    // for when hover ends
    $(this).children('.projectTitle').css("transition", "0.5s");
    $(this).children('.projectTitle').css("opacity", 0);

    $(this).children('img').css("transition", "0.5s");
    $(this).children('img').css("opacity", 1);
});

// Smooth scrolling for links to About Me and Portfolio pages
$("#aboutLinkText").click(function() {
    $('html, body').animate({
        scrollTop: $("#aboutMe").offset().top
    }, 1000);
});
$("#portfolioLinkText").click(function() {
    $('html, body').animate({
        scrollTop: $("#portfolio").offset().top
    }, 1000);
});

$("#linkToAbout").hover(function() {
    $("#aboutLinkText").transition({scale: 1.3});
}, function() {
    $("#aboutLinkText").transition({scale: 1});
});
$("#linkToPortfolio").hover(function() {
    $("#portfolioLinkText").transition({scale: 1.3});
}, function() {
    $("#portfolioLinkText").transition({scale: 1});
});

// Submit contact form and error checking
$("#form").submit(function() {
    if ($("#nameInput").val() == "")
    {
        $("#contactModalName").removeClass("has-success");
        $("#contactModalName").addClass("has-danger");

        $("#nameInput").removeClass("form-control-success");
        $("#nameInput").addClass("form-control-danger");

        $("#nameError").css("display", "block");
    }
    else
    {
        $("#contactModalName").removeClass("has-danger");
        $("#contactModalName").addClass("has-success");

        $("#nameInput").removeClass("form-control-danger");
        $("#nameInput").addClass("form-control-success");

        $("#nameError").css("display", "none");
    }

    if ($("#emailInput").val() == "")
    {
        $("#contactModalEmail").removeClass("has-success");
        $("#contactModalEmail").addClass("has-danger");

        $("#emailInput").removeClass("form-control-success");
        $("#emailInput").addClass("form-control-danger");

        $("#emailError").css("display", "block");
    }
    else
    {
        $("#contactModalEmail").removeClass("has-danger");
        $("#contactModalEmail").addClass("has-success");

        $("#emailInput").removeClass("form-control-danger");
        $("#emailInput").addClass("form-control-success");

        $("#emailError").css("display", "none");
    }

    if ($("#bodyInput").val() == "")
    {
        $("#contactModalBody").removeClass("has-success");
        $("#contactModalBody").addClass("has-danger");

        $("#bodyInput").removeClass("form-control-success");
        $("#bodyInput").addClass("form-control-danger");

        $("#bodyError").css("display", "block");
    }
    else
    {
        $("#contactModalBody").removeClass("has-danger");
        $("#contactModalBody").addClass("has-success");

        $("#bodyInput").removeClass("form-control-danger");
        $("#bodyInput").addClass("form-control-success");

        $("#bodyError").css("display", "none");
    }

    if ($("#websiteInput").val() != "")
    {
        $("#contactModalWebsite").addClass("has-success");
        $("#websiteInput").addClass("form-control-success");
    }

    if ($("#nameInput").val() != "" && $("#emailInput").val() != "" && $("#bodyInput").val() != "")
        return true;
    else
        return false;
});

// open modals of portfolio items without affecting MixItUp
$("#contactFormBtn").click(function() {
    $("#contactFormModal").modal("show");
});
$("#openModal-smartLock").click(function() {
    $("#modal-smartLock").modal("show");
});
$("#openModal-homeVR").click(function() {
    $("#modal-homeVR").modal("show");
});
$("#openModal-domainNameChecker").click(function() {
    $("#modal-domainNameChecker").modal("show");
});
$("#openModal-theDragonsLairCTF").click(function() {
    $("#modal-theDragonsLairCTF").modal("show");
});
$("#openModal-cpScripts").click(function() {
    $("#modal-cpScripts").modal("show");
});
$("#openModal-worldCupSimulator").click(function() {
    $("#modal-worldCupSimulator").modal("show");
});
$("#openModal-leagueTableSimulator").click(function() {
    $("#modal-leagueTableSimulator").modal("show");
});
$("#openModal-encryptScript").click(function() {
    $("#modal-encryptScript").modal("show");
});
$("#openModal-tlcComputerSolutions").click(function() {
    $("#modal-tlcComputerSolutions").modal("show");
});
$("#openModal-alaska").click(function() {
    $("#modal-alaska").modal("show");
});
$("#openModal-california").click(function() {
    $("#modal-california").modal("show");
});
$("#openModal-nevada").click(function() {
    $("#modal-nevada").modal("show");
});
$("#openModal-canada").click(function() {
    $("#modal-canada").modal("show");
});
$("#openModal-theScientist").click(function() {
    $("#modal-theScientist").modal("show");
});
$("#openModal-shatteredHeaven").click(function() {
    $("#modal-shatteredHeaven").modal("show");
});
$("#openModal-darkHorizon").click(function() {
    $("#modal-darkHorizon").modal("show");
});
$("#openModal-holdingTheWire").click(function() {
    $("#modal-holdingTheWire").modal("show");
});
$("#openModal-asciiIntro").click(function() {
    $("#modal-asciiIntro").modal("show");
});
$("#openModal-sinisterMeeting").click(function() {
    $("#modal-sinisterMeeting").modal("show");
});
$("#openModal-sciFiRevolver").click(function() {
    $("#modal-sciFiRevolver").modal("show");
});
$("#openModal-house").click(function() {
    $("#modal-house").modal("show");
});
$("#openModal-houseUntextured").click(function() {
    $("#modal-houseUntextured").modal("show");
});
$("#openModal-powerGenerator").click(function() {
    $("#modal-powerGenerator").modal("show");
});


// Set image sizes inside modals
$("#modal-homeVR").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-alaska").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-california").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-nevada").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-canada").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-sciFiRevolver").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-house").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-houseUntextured").on("shown.bs.modal", function () {
    setModalImageSizes();
});
$("#modal-powerGenerator").on("shown.bs.modal", function () {
    setModalImageSizes();
});

// Redraw grid and reset pages whenever the window is resized (on non-mobile/tablet devices)
$(window).resize(function() {
        setAboutMePage();
        setMainPage();
        setPortfolioPage();
        setModalImageSizes();
        setBackgroundSize();
        setCanvasGrid(canvas, gridSize, 0);
        cells = initialState(canvas, gridSize);
        drawAllCells(canvas, gridSize, cells);
        run(cells, stepDelay);
});