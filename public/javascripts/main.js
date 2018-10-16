
$(".close-alert").click(function(e){
  $(this).parent().remove();
  e.preventDefault();
});


$(document).ready(function(){
  $('.sidenav').sidenav();
});