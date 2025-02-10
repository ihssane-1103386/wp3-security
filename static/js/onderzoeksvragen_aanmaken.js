const form = document.getElementById('aanvraag-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  Swal.fire({
  title: "Voltooid!",
  text: "Uw onderzoeksvraag is aangemaakt!",
  icon: "success"
});
});