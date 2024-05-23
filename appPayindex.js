$(document).ready(function() {
  // Handle form submission to initiate payment
  $('#submitFormButton').click(function() {
    const applicationNumber = $('#applicationNumber').val();
    if (!applicationNumber) {
      alert("Please enter the application number.");
      return;
    }

    // Submit documents
    submitDocuments(applicationNumber);
  });

  // Function to submit documents (removed)

  // Handle form submission to get student details (unchanged)
  $('#getStudentDetailsForm').submit(function(e) {
    e.preventDefault();
    var applicationNumber = $('#applicationNumber').val();
    $.get('/getStudentDetails', { applicationNumber: applicationNumber }, function(data) {
      var studentDetails = '<p>Student Details:</p><p>Name: ' + data.firstName + ' ' + data.surname + ' ';
      if (data.lastName) {
        studentDetails += data.lastName;
      }
      studentDetails += '</p><p>Email Address: ' + data.emailAddress + '</p><p>Application Number: ' + data.applicationNumber + '</p><p>Course Applied: ' + data.courseApplied + '</p><p>Application Fee: ' + data.applicationFee + '</p>';
      $('#studentDetails').html(studentDetails);
      $('#applicationNumberPayment').val(applicationNumber);
      $('#first-name').val(data.firstName); // Populate first name input
      $('#last-name').val(data.surname); // Populate last name input
      $('#email-address-payment').val(data.emailAddress); // Populate email address input
      $('#amount').val(data.applicationFee); // Populate amount input
      $('#getStudentDetailsForm').hide(); // Hide get details form
      $('#makePaymentForm').show(); // Show proceed to payment form

      // Proceed to payment with fetched details
      $('#proceedToPaymentButton').click(function(e) {
        e.preventDefault();
        payWithPaystack(applicationNumber, data.emailAddress); // Call function to initiate payment with application number and email
      });
    }).fail(function() {
      $('#studentDetails').html('<p class="text-danger">Student not found!</p>');
      $('#makePaymentForm').hide(); // Hide proceed to payment form if student not found
    });
  });

  // Function to initiate payment with Paystack
  function payWithPaystack(applicationNumber, emailAddress) {
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

    // Display message with link to verify payment on the server side
    let verificationMessage = 'Click OK to verify your payment.';
    if (confirm(verificationMessage)) {
      let emailAddress = $('#email-address-payment').val(); // Get the email address used for payment
      let firstName = $('#first-name').val(); // Get the first name
      let applicationNumber = $('#applicationNumberPayment').val(); // Get the application number
      let applicationFee = $('#amount').val(); // Get the application fee
      window.location.href = '/verifyPayment?reference=' + reference + '&email=' + encodeURIComponent(emailAddress) + '&firstName=' + encodeURIComponent(firstName) + '&applicationFee=' + encodeURIComponent(applicationFee) + '&applicationNumber=' + encodeURIComponent(applicationNumber);
    }
  }
  

   // Navbar dropdown functionality
   $('.nav-item.dropdown').mouseenter(function() {
    // Show current dropdown
    $(this).find('.dropdown-menu').show();
    // Close other dropdowns
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
});
