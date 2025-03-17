(function() {
    'use strict'

    const forms = document.querySelectorAll('.validated-form')

    Array.from(forms)                                               //converted to array
        .forEach(function(form){
            form.addEventListener('submit',function(event){
                if(!form.checkValidity()){
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            },false)
        })
})()