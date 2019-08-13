// When hovering over work title, add box shadow hover to image
$(".item > .title").hover(
    function() {
        $(this).siblings(".image").css("box-shadow", "2px 4px 8px 0px rgba(46, 61, 73, 0.2)");
    },
    function() {
        $(this).siblings(".image").css("box-shadow", "5px 5px 25px 0px rgba(46, 61, 73, 0.2)");
    }
);

// When hovering over work image, add box shadow hover to title
$(".item > .image").hover(
    function() {
        $(this).siblings(".title").children("a").children("h1").css("color", "black");
    },
    function() {
        $(this).siblings(".title").children("a").children("h1").css("color", "transparent");
    }
);

// When hovering on company image, underline company name
$(".company > .image").hover(
    function() {
        $(this).siblings(".name").addClass("hover");
    },
    function() {
        $(this).siblings(".name").removeClass("hover");
    }
);

// When clicking menu item in navbar, smooth scroll to beginning of content after jumping
$("nav > .link > a").on("click", function(e) {
    if (this.hash !== "") {
        e.preventDefault();
        var newHash = $(this).parent().attr("id").replace("link-", "");
        
        if (
            !(
                window.pageYOffset < ($("#work").offset().top + window.innerHeight)
                &&
                newHash === "work"
            )
            &&
            !(
                ($("#about").offset().top - 200) < window.pageYOffset
                &&
                window.pageYOffset < ($("#about").offset().top + window.innerHeight)
                &&
                newHash === "about"
            )
            &&
            !(
                ($("#contact").offset().top - 200) < window.pageYOffset
                &&
                window.pageYOffset < ($("#contact").offset().top + window.innerHeight)
                &&
                newHash === "contact"
            )
        )
            window.location.hash = this.hash;
        
        $("html, body").animate({
            scrollTop: $(this.hash).offset().top + window.innerHeight + (newHash === "contact" ? 150 : 0)
        }, 800);
    }
});

// Run changeHash() function every 200ms when scrolling
$(document).on("scroll", function(e) {
    setTimeout(
        changeHash(
            window.innerHeight * 0.75,
            $("#work").offset().top,
            $("#about").offset().top,
            $("#contact").offset().top,
            window.location.hash.replace("#", "")
        ), 200
    );
});

// Match hash in URL with current scroll position on page 
function changeHash(vh, workTop, aboutTop, contactTop, prevHash) {
    if (
        window.pageYOffset <= (workTop + vh)
        ||
        ((aboutTop - 200) <= window.pageYOffset && window.pageYOffset <= (aboutTop + vh))
        ||
        ((contactTop - 200) <= window.pageYOffset && window.pageYOffset <= (contactTop + vh))
    ) {
        $("#link-work").removeClass("active");
        $("#link-about").removeClass("active");
        $("#link-contact").removeClass("active");
        history.pushState(null, null, "#");
    } else if (
        ((workTop + vh) < window.pageYOffset)
        &&
        (window.pageYOffset < aboutTop - 200)
        &&
        prevHash !== "work"
    ) {
        $("#link-work").addClass("active");
        $("#link-about").removeClass("active");
        $("#link-contact").removeClass("active");
        history.pushState(null, null, "#work");
    } else if (
        ((aboutTop + vh) < window.pageYOffset)
        &&
        (window.pageYOffset < (contactTop - 200))
        &&
        prevHash !== "about"
    ) {
        $("#link-work").removeClass("active");
        $("#link-about").addClass("active");
        $("#link-contact").removeClass("active");
        history.pushState(null, null, "#about");
    } else if (
        ((contactTop + vh) < window.pageYOffset)
        &&
        prevHash !== "contact"
    ) {
        $("#link-work").removeClass("active");
        $("#link-about").removeClass("active");
        $("#link-contact").addClass("active");
        history.pushState(null, null, "#contact");
    }
}

// Submit contact form and error checking
$("form").submit(function() {
    var fullName = $("#full-name > label > input").val();
    var emailAddress = $("#email-address > label > input").val();
    var message = $("#message > label > textarea").val();
    
    if (fullName == "") {
        $("#full-name").removeClass("valid");
        $("#full-name").addClass("invalid");
        $("#full-name > .error-message").css("display", "block");
    } else {
        $("#full-name").removeClass("invalid");
        $("#full-name").addClass("valid");
        $("#full-name > .error-message").css("display", "none");
    }
    
    if (emailAddress == "") {
        $("#email-address").removeClass("valid");
        $("#email-address").addClass("invalid");
        $("#email-address > .error-message").css("display", "block");
    } else {
        $("#email-address").removeClass("invalid");
        $("#email-address").addClass("valid");
        $("#email-address > .error-message").css("display", "none");
    }
    
    if (message == "") {
        $("#message").removeClass("valid");
        $("#message").addClass("invalid");
        $("#message > .error-message").css("display", "block");
    } else {
        $("#message").removeClass("invalid");
        $("#message").addClass("valid");
        $("#message > .error-message").css("display", "none");
    }
    
    if (fullName != "" && emailAddress != "" && message != "")
        return true;
    else
        return false;
});

// Remove form validity classes if a user edits the input
$("input, textarea").on('input', function() {
    $(this).parent().parent().removeClass("valid");
    $(this).parent().parent().removeClass("invalid");
    $(this).parent().siblings(".error-message").css("display", "none");
});

// Smooth scrolling when returning to home page from projects page when clicking on menu link
$(function() {
    if (window.location.search.indexOf('?to=work') > -1) {
        $('html, body').animate({
            scrollTop: $("#work").offset().top + window.innerHeight
        }, 800);
        window.history.replaceState(null, null, window.location.pathname);
    }
    else if (window.location.search.indexOf('?to=about') > -1) {
        $('html, body').animate({
            scrollTop: $("#about").offset().top + window.innerHeight
        }, 800);
        window.history.replaceState(null, null, window.location.pathname);
    }
    else if (window.location.search.indexOf('?to=contact') > -1) {
        $('html, body').animate({
            scrollTop: $("#contact").offset().top + window.innerHeight + 150
        }, 800);
        window.history.replaceState(null, null, window.location.pathname);
    }
});