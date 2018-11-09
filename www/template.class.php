<?php

class TemplateManager {

    public $mpl_save_directory = '/mpl';

    public function __construct(){

    }

    public function printCommandOption($text,$option){
        $text = htmlentities($text, ENT_QUOTES);
        $option = htmlentities($option, ENT_QUOTES);
        echo '<h4>' .$text. ': <span class="code">' .$option. '</span></h4>'."\n";
    }

    public function printOptionDetail($text){
        echo '<h5>' .$text. '</h5>'."\n";
    }

    public function printCfgParamLink($cfg_param,$txt=null){
        if(!$txt) $txt='cfg.'.$cfg_param;
        echo '<a href="#cfgparam-'.$cfg_param.'">'.$txt.'</a>';
    }

    public function  printCfgParamID($cfg_param){
        echo 'cfgparam-'.$cfg_param;
    }

}

?>