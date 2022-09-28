<?php
//FORM LOGIC
//DEFAULTS...

$Request = '';
$TemplateID = '';
$FullName = '';
$BusinessName = '';
$EmailAddress = '';
$Telephone = '';
$Website = '';
$Comments = '';
$Country = "";
$formErrors = array();
$blnFormSent = FALSE;
$isHuman=FALSE;
$strPhoneNumber = '';
$Province = '';
$City = '';


class GoogleRecaptcha 
{

    /* Google recaptcha API url */
    private $google_url = "https://www.google.com/recaptcha/api/siteverify";
    private $secret = '6LcxG1whAAAAAHTJwR0nFTseNCCUkpemhr4-pK7M';
 
    public function VerifyCaptcha($response)
    {
        $url = $this->google_url."?secret=".$this->secret.
                "&response=".$response;
 
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        //curl_setopt($curl, CURLOPT_HEADER, 1); 
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_TIMEOUT, 15);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0); 

        $curlData = curl_exec($curl);
 
        curl_close($curl);
 
        $res = json_decode($curlData, TRUE);
        if($res['success'] == 'true'){ 
            return TRUE;
        }else{
            return FALSE;
        }
    }
}//\class GoogleRecaptcha 

//Clean Data
function cleanData($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    //Captcha
    if (!empty($_POST['g-recaptcha-response'])) {
        $response = $_POST['g-recaptcha-response'];
        $cap = new GoogleRecaptcha();
        $GoogleRecaptchaResponse = $cap->VerifyCaptcha($response);

    //\Captcha

    if (!empty($_POST["Request"])) {
        $Request = cleanData($_POST["Request"]);
        $_GET["Request"] = $Request;
    }

    if (empty($_POST["FullName"])) {
        $temp = array_push($formErrors,"<li class='form_error'>Please Provide your Full Name.</li>");
    } else {
        $FullName = cleanData($_POST["FullName"]);
        //check if name only contains letters and whitespace
        if (!preg_match("/^[a-zA-Z ]*$/",$FullName)) {
        $temp = array_push($formErrors,"<li class='form_error'>Only letters and white space allowed for your Full Name.</li>");
        }
    }
    if (!empty($_POST["BusinessName"])) {
        $BusinessName = cleanData($_POST["BusinessName"]);
    }
    if (empty($_POST["EmailAddress"])) {
        $temp = array_push($formErrors,"<li class='form_error'>Please Provide your Email Address.</li>");
    } else {
        $EmailAddress = cleanData($_POST["EmailAddress"]);
        // check if e-mail address is well-formed
        if (!filter_var($EmailAddress, FILTER_VALIDATE_EMAIL)) {
        $temp = array_push($formErrors,"<li class='form_error'>Invalid email format.</li>");
        }
    }
    if (!empty($_POST["Telephone"])) {
        $Telephone = cleanData($_POST["Telephone"]);
    }
    if (!empty($_POST["Website"])) {
        $Website = cleanData($_POST["Website"]);
        // check if URL address syntax is valid (this regular expression also allows dashes in the URL)
        if (!preg_match("/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i",$Website)) {
          $temp = array_push($formErrors,"<li class='form_error'>Invalid Website URL.</li>");  
        }
    }
    if (!empty($_POST["Comments"])) {
        $Comments= cleanData($_POST["Comments"]);
    }

    if (!empty($_POST["City"])) {
        $City= cleanData($_POST["City"]);
    }
    if (!empty($_POST["Province"])) {
        $Province= cleanData($_POST["Province"]);
    }
    if (!empty($_POST["Country"])) {
        $Country= cleanData($_POST["Country"]);
    }


    if (!empty($_POST["TemplateID"])) {
        $TemplateID= cleanData($_POST["TemplateID"]);
    }



    




if (count($formErrors) == 0){

    if($GoogleRecaptchaResponse) {
    
        //Submit Form to Email...
      $_POST['g-recaptcha-response'] = "";
            $email_message = '';               
                    foreach ($_POST as $key => $value) {


                        if($Key == 'CallBackTime'){
                            $myArray1 = $_POST['CallBackTime'];
                            for ($i=0, $len=count($myarray1); $i<$len; $i++) {
                                $email_message .= $myarray1[$i].chr(10).chr(10);
                            }
                        }


                        if($key == 'BestDaytoReach'){
                            $myarray2 = $_POST['BestDaytoReach'];
                            for ($i=0, $len=count($myarray2); $i<$len; $i++) {
                                $email_message .= $myarray2[$i].chr(10).chr(10);
                            }
                        }

                        $email_message .= $key.": ";
                        $email_message .= $value.chr(10).chr(10);
                    }
                    $email_message .= $_SERVER["REMOTE_ADDR"];
            // email

                $email_to = "pavlenko@shaw.ca";
                $email_from = "info@alex.pavlenko.ca"; // the email address used as "From" when submissions are sent to the $email_to above (important that it has the same domain as the domain of your site - unless you have configured your server's mail settings)
                $email_subject = " Contact Form";
                $headers = 'From: '.$email_from."\r\n".
                'Reply-To: '.$EmailAddress."\r\n" .
                'X-Mailer: PHP/' . phpversion();
                if (mail($email_to, $email_subject, $email_message, $headers))
                {
                    $blnFormSent = TRUE;
                    $Request = '';
                    $TemplateID = '';
                    $FullName = '';
                    $BusinessName = '';
                    $EmailAddress = '';
                    $Telephone = '';
                    $Website = '';
                    $Comments = '';
                    $City = '';
                    $Province = '';
                    $Country = '';
                }
                else {
                    $temp = array_push($formErrors,"<li class='form_error'>System Failed to Send email. Please try again.</li>");
                }
            // end email
    } else {
        $temp = array_push($formErrors,"<li class='form_error'>Captcha is incorrect.</li>");
    }//\if($GoogleRecaptchaResponse) {
}//\if (count($formErrors) == 0){

    }else{
        $response = '';
        $GoogleRecaptchaResponse = '';
        $key = '';

    }



    }//\if ($_SERVER["REQUEST_METHOD"] == "POST") {

//\CONTACT FORM LOGIC

?>