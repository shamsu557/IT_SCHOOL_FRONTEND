$(document).ready(function() {
// Handle form submission to get student details
$('#getAdmissionDetailsForm').submit(function(e) {
  e.preventDefault();
  var admissionNumber = $('#admissionNumber').val();
  $.get('/getStudentinfo', { admissionNumber: admissionNumber })
    .done(function(data) {
      var studentDetails = '<p>Student Details:</p><p>Name: ' + data.firstName + ' ' + data.surname + ' ';
      if (data.lastName) {
        studentDetails += data.lastName;
      }
      studentDetails += '</p><p>Email Address: ' + data.emailAddress + '</p><p>Admission Number: ' + data.admissionNumber + '</p><p>Course Applied: ' + data.courseApplied + '</p><p>School Fee: ' + data.schoolFee + '</p><p>Installment Amount: ' + data.firstInstallmentFee + '</p>';
      
      
      $('#studentDetails').html(studentDetails);
      $('#admissionNumberPayment').val(admissionNumber);
      $('#first-name').val(data.firstName); // Populate first name input
      $('#last-name').val(data.lastName); // Populate last name input
      $('#sur-name').val(data.surname);
      $('#email-address-payment').val(data.emailAddress); // Populate email address input
      $('#amount').val(data.firstInstallmentFee); // Populate amount input with first installment fee
      $('#getAdmissionDetailsForm').hide(); // Hide get details form
      $('#makeAdmissionPaymentForm').show(); // Show proceed to payment form
    })
    .fail(function() {
      $('#studentDetails').html('<p class="text-danger">Student not found!</p>');
      $('#makeAdmissionPaymentForm').hide(); // Hide proceed to payment form if student not found
     });
  });

  // Proceed to payment with fetched details
  $('#proceedToPaymentButton').click(function(e) {
    e.preventDefault();
    var admissionNumber = $('#admissionNumber').val();
    var emailAddress = $('#email-address-payment').val();
    payWithPaystack(admissionNumber, emailAddress); // Call function to initiate payment with application number and email
  });
});

// Function to initiate payment with Paystack
function payWithPaystack(admissionNumber, emailAddress) {
  var handler = PaystackPop.setup({
    key: 'pk_live_e6942e61f70c87019cbeb64ffed04e10fbd2ee10', // Replace with your public key
    email: emailAddress,
    amount: parseFloat($('#amount').val()) * 100,
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
  var message = 'Payment complete! Reference: ' + reference;
  alert(message);

  // Display message with link to verify payment on the server side
  var verificationMessage = 'Click OK to verify your payment.';
  if (confirm(verificationMessage)) {
    var emailAddress = $('#email-address-payment').val(); // Get the email address used for payment
    var firstName = $('#first-name').val(); // Get the first name
    var admissionNumber = $('#admissionNumberPayment').val(); // Get the application number
    var firstInstallmentFee = $('#amount').val(); // Get the first installment fee
    window.location.href = '/verifyPay?reference=' + reference + '&email=' + encodeURIComponent(emailAddress) + '&firstName=' + encodeURIComponent(firstName) + '&firstInstallmentFee=' + encodeURIComponent(firstInstallmentFee) + '&admissionNumber=' + encodeURIComponent(admissionNumber);
  }
}

// Navbar dropdown functionality
$('.nav-item.dropdown').hover(function() {
  $(this).find('.dropdown-menu').show();
  $('.nav-item.dropdown').not(this).find('.dropdown-menu').hide();
});

// Close dropdown when clicking outside of it or hovering over another navbar item
$(document).on('click mouseenter', function(e) {
  if (!$(e.target).closest('.nav-item.dropdown').length) {
    $('.dropdown-menu').hide();
  }
});

// Scroll to top button
var mybutton = document.getElementById("myBtn");
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

// Function to scroll to top when the button is clicked
$('#myBtn').click(function() {
  $('html, body').animate({ scrollTop: 0 }, 'fast');
  return false;
});
