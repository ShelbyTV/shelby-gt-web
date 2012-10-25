if (typeof(shelby) == 'undefined') {
  shelby = {};
}
if (typeof(shelby.config) == 'undefined') {
  shelby.config = {};
}
shelby.config.user = {
  email : {
    validationRegex : /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  },
  password : {
    minLength : 5
  }
};