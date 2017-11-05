// functions for the pages
function setAboutUsPage() {
    $("#aboutUs").css("padding-left", $(window).width() * 0.1);
    $("#aboutUs").css("padding-right", $(window).width() * 0.1);
    $("#aboutUs").css("padding-top", $(window).height() * 0.1);
    $("#aboutUs").css("padding-bottom", $(window).height() * 0.1);
    $("#aboutUs").width($(window).width() * 0.8);
    $("#aboutUs").height($(window).height() * 0.8);

    // sets the font size of the page's title based on the window's width
    if ($(window).width() <= 1000)
        $("#aboutUsTitle").css("font-size", "40px");
    else if ($(window).width() <= 1300)
        $("#aboutUsTitle").css("font-size", "49px");
    else if ($(window).width() <= 1600)
        $("#aboutUsTitle").css("font-size", "66px");
    else if ($(window).width() <= 1900)
        $("#aboutUsTitle").css("font-size", "83px");
    else
        $("#aboutUsTitle").css("font-size", "100px");

    $("#bio").css("padding", "20px");
    $("#aboutUsMainText").height($("#aboutUs").height() - $("#aboutUsTitle").height() - $("#aboutUsBtn").height());

    // sets the width & height of the profile picture as 25% of the height of the text box or 33% of the width of the text box, whichever is less
    var profileWH = 0;
    if (($("#aboutUsMainText").width() / 3) < ($("#aboutUsMainText").height() / 4))
        profileWH = Math.ceil($("#aboutUsMainText").width() / 3);
    else
        profileWH = Math.ceil($("#aboutUsMainText").height() / 3);

    $("#profile").width(profileWH + "px");
    $("#profile").height(profileWH + "px");

    // set correct sizing for "sent email" alert
    $(".alert").css("margin-left", $(window).width() * 0.1);
    $(".alert").css("margin-right", $(window).width() * 0.1);
    $(".alert").css("margin-top", $(window).height() * 0.1);
    $(".alert").css("margin-bottom", $(window).height() * 0.1);

    if (Math.abs($("#aboutUs").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) > 10)
    {
        $(".alert").css("margin-left", (parseFloat($(".alert").css("margin-left")) + (($("#aboutUs").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) / 2)) + "px");
        $(".alert").css("margin-right", (parseFloat($(".alert").css("margin-right")) + (($("#aboutUs").width() - ($(".alert").width() + parseFloat($(".alert").css("padding-left")) + parseFloat($(".alert").css("padding-right")))) / 2)) + "px");
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

    $("#portfolioTitle").css("font-size", $("#aboutUsTitle").css("font-size"));
}

setAboutUsPage();
setMainPage();
setPortfolioPage();

// Enable hover for text on project when project tile is hovered over
$(".project").hover(function () {
    $(this).children('img').css("transition", "0.5s");
    $(this).children('img').css("opacity", 0.7);

}, function () {
    $(this).children('img').css("transition", "0.5s");
    $(this).children('img').css("opacity", 1);
});

// Smooth scrolling for links to About Me and Portfolio pages
$("#aboutLinkText").click(function() {
    $('html, body').animate({
        scrollTop: $("#aboutUs").offset().top
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


// open modals of portfolio items
$("#openModal-8950DiningTableByRolfBenz").click(function() {
    $("#modal-8950DiningTableByRolfBenz").modal("show");
});
$("#openModal-AboutAChairByHay").click(function() {
    $("#modal-AboutAChairByHay").modal("show");
});
$("#openModal-AC4OfficeChairByVitra").click(function() {
    $("#modal-AC4OfficeChairByVitra").modal("show");
});
$("#openModal-AnamorphicConsoleByAsherIsraelow").click(function() {
    $("#modal-AnamorphicConsoleByAsherIsraelow").modal("show");
});
$("#openModal-ArmchairRockerByVitraEames").click(function() {
    $("#modal-ArmchairRockerByVitraEames").modal("show");
});
$("#openModal-BB8").click(function() {
    $("#modal-BB8").modal("show");
});
$("#openModal-BeoPlayH6HeadphonesByBangAndOlufsen").click(function() {
    $("#modal-BeoPlayH6HeadphonesByBangAndOlufsen").modal("show");
});
$("#openModal-BluetoothGramophoneByGramovox").click(function() {
    $("#modal-BluetoothGramophoneByGramovox").modal("show");
});
$("#openModal-CootTableByTacchini").click(function() {
    $("#modal-CootTableByTacchini").modal("show");
});
$("#openModal-DeployTableByBossDesign").click(function() {
    $("#modal-DeployTableByBossDesign").modal("show");
});
$("#openModal-DeskGreenByNobodinoz").click(function() {
    $("#modal-DeskGreenByNobodinoz").modal("show");
});
$("#openModal-FarnsworthHouseByLego").click(function() {
    $("#modal-FarnsworthHouseByLego").modal("show");
});
$("#openModal-GrandReposChair").click(function() {
    $("#modal-GrandReposChair").modal("show");
});
$("#openModal-HackneySofaByHay").click(function() {
    $("#modal-HackneySofaByHay").modal("show");
});
$("#openModal-InfinityClockByBosaCeramiche").click(function() {
    $("#modal-InfinityClockByBosaCeramiche").modal("show");
});
$("#openModal-KS9500Curved4KSUHDTVBySamsung").click(function() {
    $("#modal-KS9500Curved4KSUHDTVBySamsung").modal("show");
});
$("#openModal-LegamiBedByZanotta").click(function() {
    $("#modal-LegamiBedByZanotta").modal("show");
});
$("#openModal-LeicaM9DigitalCameraByLeica").click(function() {
    $("#modal-LeicaM9DigitalCameraByLeica").modal("show");
});
$("#openModal-LeyaLoungeByFreifrau").click(function() {
    $("#modal-LeyaLoungeByFreifrau").modal("show");
});
$("#openModal-LinieMContainerSystemByMuellerManufaktur").click(function() {
    $("#modal-LinieMContainerSystemByMuellerManufaktur").modal("show");
});
$("#openModal-NewiMacByApple").click(function() {
    $("#modal-NewiMacByApple").modal("show");
});
$("#openModal-PikapOTT2000ByPhilips").click(function() {
    $("#modal-PikapOTT2000ByPhilips").modal("show");
});
$("#openModal-Plant").click(function() {
    $("#modal-Plant").modal("show");
});
$("#openModal-RockyHorseByMagis").click(function() {
    $("#modal-RockyHorseByMagis").modal("show");
});
$("#openModal-TitanesSideboardByMaxalto").click(function() {
    $("#modal-TitanesSideboardByMaxalto").modal("show");
});
$("#openModal-TitaniumRadioClockByLexon").click(function() {
    $("#modal-TitaniumRadioClockByLexon").modal("show");
});
$("#openModal-TuftyTime15SofaByBAndBItalia").click(function() {
    $("#modal-TuftyTime15SofaByBAndBItalia").modal("show");
});
$("#openModal-VitoStoolByAreaDeclic").click(function() {
    $("#modal-VitoStoolByAreaDeclic").modal("show");
});

// Redraw grid and reset pages whenever the window is resized (on non-mobile/tablet devices)
$(window).resize(function() {
        setAboutUsPage();
        setMainPage();
        setPortfolioPage();
});
