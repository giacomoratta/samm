<?php

class TemplateManager {

    public function __construct(){
    }

    public function printCommandOption($text,$option){
        $text = htmlentities($text, ENT_QUOTES);
        $option = htmlentities($option, ENT_QUOTES);
        echo '<h4>' .$text. ': <span class="code">' .$option. '</span></h4>'."\n";
    }

}

?>