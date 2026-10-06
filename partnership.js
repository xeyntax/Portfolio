// ===============================
// GOOGLE APPS SCRIPT URL
// ===============================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDidEcODwMGZS9VljG0o3gj-5rjnhe0bOGGyDlQ7B_wFqdOj9xtmeQhlcFYeo2ywEOjg/exec";


// ===============================
// CURRENT YEAR
// ===============================

document.getElementById('year').textContent = new Date().getFullYear();


// ===============================
// FORM ELEMENTS
// ===============================

const form = document.getElementById('partnershipForm');

const otherCountryRadio = document.getElementById('otherCountryRadio');

const otherCountry = document.getElementById('otherCountry');

const successDialog = document.getElementById('successDialog');


// ===============================
// COUNTRY SELECTION
// ===============================

form.addEventListener('change', (event) => {

    // Your HTML uses "originCountry"
    if (event.target.name !== 'originCountry') return;

    const isOther = otherCountryRadio.checked;

    // Enable/disable the text box
    otherCountry.disabled = !isOther;

    // Make it required only when "Others" is selected
    otherCountry.required = isOther;

    if (isOther) {

        // Automatically place the cursor in the text box
        otherCountry.focus();

    } else {

        // Clear the text box if another country is selected
        otherCountry.value = '';

    }

});


// ===============================
// FORM SUBMISSION
// ===============================

form.addEventListener('submit', async (event) => {

    // Stop the normal form submission
    event.preventDefault();


    // Check required fields
    if (!form.reportValidity()) {
        return;
    }


    // Collect all form data
    const formData = new FormData(form);


    // If "Others" is selected,
    // use the country typed into the text box
    if (otherCountryRadio.checked) {
        formData.set('originCountry', otherCountry.value);
    }

    successDialog.showModal();

    try {

        // Send the form information to Google Apps Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });

        // Reset the form
        form.reset();


        // Reset the "Other country" field
        otherCountry.disabled = true;
        otherCountry.required = false;
        otherCountry.value = '';


    } catch (error) {

        console.error('Form submission error:', error);

        alert(
            'Something went wrong while submitting your application. Please try again.'
        );

    }

});


// ===============================
// SUCCESS DIALOG / BACK TO TOP
// ===============================

document.getElementById('backToTop').addEventListener('click', () => {

    successDialog.close();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

});