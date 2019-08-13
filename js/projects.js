// On page load, smooth scroll to first item
$(function(){
    $('html, body').animate({
        scrollTop: $(".project > .item:nth-child(1)").offset().top - ((window.innerHeight - $(".project > .item:nth-child(1)").height()) / 2)
    }, 800);
    return false;
});