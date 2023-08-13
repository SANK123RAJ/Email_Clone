document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#View-entire-mail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
//Posting the mail
  

  }

function send_email(event){
  event.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  console.log("DONESUBMIT");
  load_mailbox('sent');
  
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#View-entire-mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h1>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h1>`;
  document.querySelector('#emails-view').style.marginBottom = "50px";

  
  //fetchind all mails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(mail => {
        const element = document.createElement('div');
        //element.textContent = 'This is the content of the div.';
        element.classList.add('e-mails-box');
        const senderemail = document.createElement('h5');
        senderemail.classList.add('sender-e-mail-box');
        senderemail.innerHTML = mail.sender;
        const read = mail.read;
        const subject = document.createElement('p');
        subject.innerHTML = mail.subject;
        subject.classList.add('subject-box');
        const Timestamp = document.createElement('p');
         Timestamp.innerHTML = mail.timestamp;
        Timestamp.classList.add('timestamp-box');
        element.appendChild(senderemail);
        element.appendChild(subject);
        element.appendChild(Timestamp);
        if( read == true){
          element.style.backgroundColor = "white";
        }
        element.addEventListener("click", () =>Viewmail(mail.id));
        document.querySelector('#emails-view').appendChild(element);
        console.log("DONE");
      
    })});
};


function Viewmail(mailid) {

  document.querySelector('#View-entire-mail').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';


  // Fetching info of email
  fetch(`/emails/${mailid}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      document.querySelector('#sender').innerHTML = email.sender;
      document.querySelector('#reciever').innerHTML = email.recipients;
      document.querySelector('#subject').innerHTML = email.subject;
      document.querySelector('#timestamp').innerHTML = email.timestamp;
      document.querySelector('#body').innerHTML = email.body;

      // Setting read as true
      fetch(`/emails/${mailid}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });

      // To archive or unarchive
      function archive_unarchive(is_archive) {
        fetch(`/emails/${mailid}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !is_archive
          })
        }).then(() => {
          console.log(email.archived);
          load_mailbox('inbox');
          // Perform any additional actions after archiving/unarchiving
        });
      }

      if (email.archived == true) {
        console.log("archieved");
        
        document.querySelector('#archieve').style.display = 'none';
        document.querySelector('#unarchieve').style.display = 'block';
        document.querySelector('#unarchieve').addEventListener("click", () => archive_unarchive(true));
      } else {
        console.log("unarchieved");
        document.querySelector('#archieve').style.display = 'block';
        document.querySelector('#unarchieve').style.display = 'none';
        document.querySelector('#archieve').addEventListener("click", () => archive_unarchive(false));
      }
       //for reply
      document.querySelector('#reply').addEventListener("click", () => reply());

      function reply(){
        document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#View-entire-mail').style.display = 'none';

  // re-setting composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if( email.subject.substring(0, 3)  === ('Re:'))
  {
    document.querySelector('#compose-subject').value = email.subject;

  }
  else{
    document.querySelector('#compose-subject').value = 'Re: ' + email.subject;

  }
  
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote :    ` + email.body + '       >>>>>>>>>>>       ' ;

      }


     
    });
}