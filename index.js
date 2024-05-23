$(document).ready(function() {
    // Function to handle click event for View Application button
    $('#viewButton').click(function() {
        // Hide the application form and show the application details
        $('#applicationForm').hide();
        $('#applicationDetails').show();

        // Function to create an image preview URL
        function getImagePreview(inputId) {
            const input = $(`#${inputId}`)[0];
            if (input.files && input.files[0]) {
                return URL.createObjectURL(input.files[0]);
            }
            return '';
        }
// Gather data from the form
var applicationDetails = `
    <h3>Application Details</h3>
    <p><strong>Surname:</strong> ${$('#surname').val()}</p>
    <p><strong>First Name:</strong> ${$('#firstName').val()}</p>
    <p><strong>Last Name:</strong> ${$('#lastName').val()}</p>
    <p><strong>Address:</strong> ${$('#address').val()}</p>
    <p><strong>Email Address:</strong> ${$('#emailAddress').val()}</p>
    <p><strong>Phone Number:</strong> ${$('#phoneNumber').val()}</p>
    <p><strong>Date of Birth:</strong> ${$('#dob').val()}</p>
    <p><strong>Highest Qualification:</strong> ${$('#highestQualification').val()}</p>
    <p><strong>Course Applied:</strong> ${$('#courseApplied').val()}</p>
    <p><strong>Have a Computer Certificate?:</strong> ${$('#hasComputerCertificate').val()}</p>
    <p><strong>Picture:</strong> <img src="${getImagePreview('picture')}" alt="Picture" style="max-width: 100px;"></p>
    <p><strong>Primary Certificate:</strong> <img src="${getImagePreview('primaryCert')}" alt="Primary Certificate" style="max-width: 100px;"></p>
    <p><strong>Secondary School Certificate:</strong> <img src="${getImagePreview('secondaryCert')}" alt="Secondary Certificate" style="max-width: 100px;"></p>
    <p><strong>Higher Institution Certificate:</strong> <img src="${getImagePreview('higherCert')}" alt="Higher Certificate" style="max-width: 100px;"></p>
    <p><strong>Computer Certificate:</strong> <img src="${getImagePreview('computerCert')}" alt="Computer Certificate" style="max-width: 100px;"></p>
    <button type="button" id="okButton" class="btn btn-primary">OK</button>
    <button type="button" id="detailsEditButton" class="btn btn-warning">Edit Application</button>
`;

        // Display the application details
        $('#detailsContent').html(applicationDetails);

        // Send a request to fetch the application form based on the application number
        var applicationNumber = $('#applicationNumber').val(); // Assuming you have an input field with id 'applicationNumber'
        $.get(`/application_form/${applicationNumber}`, function(data) {
            // Handle the response if needed
        });

        // Function to handle click event for OK button
        $('#okButton').click(function() {
            $('#applicationForm :input').prop('disabled', false);
            $('#applicationDetails').hide();
            $('#applicationForm').show();
            $('#viewButton').show();
            $('#editButton').hide();
            $('#submitButton').show();
        });

        // Function to handle click event for Edit Application button in details
        $('#detailsEditButton').click(function() {
            $('#applicationForm :input').prop('disabled', false);
            $('#applicationDetails').hide();
            $('#applicationForm').show();
            $('#viewButton').show();
            $('#editButton').hide();
            $('#submitButton').show();
        });
    });

    // Function to handle click event for Edit Application button
    $('#editButton').click(function() {
        // Enable form fields
        $('#applicationForm :input').prop('disabled', false);

        // Show the View and Submit buttons, hide the Edit button
        $('#editButton').hide();
        $('#viewButton').show();
        $('#submitButton').show();
    });

    // Handle form submission to get student details for school payment
    $('#getAdmissionDetailsForm').submit(function(e) {
        e.preventDefault();
        var admissionNumber = $('#admissionNumber').val();
        var paymentNumber = $('#paymentNumber').val(); // Added paymentNumber retrieval
        if (!admissionNumber) {
            alert("Please enter the admission number.");
            return;
        }

        // Submit admission details form
        $.get('/getStudentDetails', { admissionNumber: admissionNumber, paymentNumber: paymentNumber }, function(data) {
            var studentDetails = '<p>Student Details:</p><p>Name: ' + data.firstName + ' ' + data.surname + ' ';
            if (data.lastName) {
                studentDetails += data.lastName;
            }
            studentDetails += '</p><p>Email Address: ' + data.emailAddress + '</p><p>Admission Number: ' + data.admissionNumber + '</p><p>Course Applied: ' + data.courseApplied + '</p><p>School Fee: ' + data.schoolFee + '</p>';
            $('#studentDetails').html(studentDetails);
            $('#admissionNumberPayment').val(admissionNumber);
            $('#first-name').val(data.firstName); // Populate first name input
            $('#last-name').val(data.surname); // Populate last name input
            $('#email-address-payment').val(data.emailAddress); // Populate email address input

            // Determine installment amount based on course and paymentNumber
            var installmentAmount = 0;
            if (data.courseApplied === "Web Development") {
                installmentAmount = paymentNumber === "1" ? 100 : 100; // First installment and second installment amount for Web Development
            } else if (data.courseApplied === "Computer Application ") {
                installmentAmount = paymentNumber === "1" ? 101 : 101; // First installment and second installment amount for Computer Application 
            }

            $('#amount').val(installmentAmount); // Populate amount input
            $('#getAdmissionDetailsForm').hide(); // Hide get details form
            $('#makeAdmissionPaymentForm').show(); // Show proceed to payment form

            // Proceed to payment with fetched details
            $('#proceedToPaymentButton').click(function(e) {
                e.preventDefault();
                if (!firstPaymentMade && paymentNumber === "2") {
                    alert("Please make the first installment payment before proceeding to the second installment.");
                    return;
                }
                payWithPaystack(admissionNumber, data.emailAddress); // Call function to initiate payment with admission number and email
            });
        }).fail(function() {
            $('#studentDetails').html('<p class="text-danger">Student not found!</p>');
            $('#makeAdmissionPaymentForm').hide(); // Hide proceed to payment form if student not found
        });
    });

    // Function to initiate payment with Paystack
    function payWithPaystack(reference, emailAddress) {
        let handler = PaystackPop.setup({
            key: 'pk_live_e6942e61f70c87019cbeb64ffed04e10fbd2ee10', // Replace with your public key
            email: emailAddress,
            amount: document.getElementById("amount").value * 100,
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            onClose: function() {
                alert('Window closed.');
            },
            callback: function(response) {
                handlePaymentResponse(response.reference);
            }
        });

        handler.openIframe();
    }

    // Function to handle payment response
    function handlePaymentResponse(reference) {
        let message = 'Payment complete! Reference: ' + reference;
        alert(message);

        // If first installment is paid, set the flag to true
        if ($('#paymentNumber').val() === "1") {
            firstPaymentMade = true;
        }

        // Display message with link to verify payment on the server side
        let verificationMessage = 'Click OK to verify your payment.';
        if (confirm(verificationMessage)) {
            let emailAddress = $('#email-address-payment').val(); // Get the email address used for payment
            let firstName = $('#first-name').val(); // Get the first name
            let applicationNumber = $('#applicationNumberPayment').val(); // Get the application number
            let admissionNumber = $('#admissionNumberPayment').val(); // Get the admission number
            let applicationFee = $('#amount').val(); // Get the application fee
            window.location.href = '/verifyPayment?reference=' + reference + '&email=' + encodeURIComponent(emailAddress) + '&firstName=' + encodeURIComponent(firstName) + '&applicationFee=' + encodeURIComponent(applicationFee) + '&applicationNumber=' + encodeURIComponent(applicationNumber) + '&admissionNumber=' + encodeURIComponent(admissionNumber);
        }
    }

    // Navbar dropdown functionality (unchanged)
    $('.nav-item.dropdown').hover(function() {
        // Show current dropdown
        $(this).find('.dropdown-menu').show();
        // Close other dropdowns
        $('.nav-item.dropdown').not(this).find('.dropdown-menu').hide();
    });

    // Close dropdown when clicking outside of it or hovering over another navbar item (unchanged)
    $(document).on('click mouseenter', function(e) {
        if (!$(e.target).closest('.nav-item.dropdown').length) {
            $('.dropdown-menu').hide();
        }
    });

    // Scroll to top button (unchanged)
    let mybutton = document.getElementById("myBtn");
    window.onscroll = function() {
        scrollFunction();
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    // Function to scroll to top when the button is clicked (unchanged)
    $('#myBtn').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        return false;
    });
});
