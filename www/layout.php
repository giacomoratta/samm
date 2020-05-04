<?php
include('template.class.php');
$TemplateMgr = new TemplateManager();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Layout</title>
    <link rel="stylesheet" type="text/css" href="./css/reset.css">
    <link rel="stylesheet" type="text/css" href="./css/base.css">
    <link rel="stylesheet" type="text/css" href="./css/responsive.css">
</head>
<body>

<header>
    <h1>SAMM: a creativity-oriented samples manager</h1>
    <section class="whatis">
        <p>
            SAMM is a command line based software
            which helps your creativity flow. Dive into your wide samples library,
            make researches, extract random samples and save them into the current project directory.
        </p>
    </section>
    <section class="howhelp">
        <p>
            Save your creativity flow without wasting time with your wide samples collection.
        </p>
        <p>
            Improve your creativity with a random selection of your samples, base on a detailed query.
        </p>
        <p>
            Easy, fast and light interface to avoid CPU and RAM wastefulness.
        </p>
    </section>

</header>

<section class="central_container">

    <section class="ideasbehind">
        <h2>What SAMM can do for you</h2>
        <section class="text">
            <p>
                <strong>Save your creativity flow!</strong> SAMM avoid wasting your time dealing with hundred of samples
                inside many nested directories. With SAMM you just ask!
            </p>
            <p>
                <strong>Improve your creativity with randomness!</strong> SAMM does not care about how you organize your samples.
                SAMM selects samples randomly based on detailed queries. Sometime you will <strong>find old-but-gold samples</strong>
                again or <strong>some good unwanted samples</strong> which for some reasons matched the query.
            </p>
            <p>
                <strong>Why this <i>nerd</i> interface?</strong> Don't be afraid about the command line: it's easy, it's fast, it's light.
                It does not waste CPU and RAM: these are necessary for your DAW!
            </p>
        </section>
    </section>

    <?php include('sections/email_form.php'); ?>

    <section>
        <h2>Getting started</h2>

        <h4>Installation</h4>
        <section class="text">
            <ol>
                <li><p>Download the application</p></li>
                <li><p>Unzip the application in a folder</p></li>
                <li><p>Add the path to the environment variable PATH</p></li>
                <li><p>Close and open the console, try if the short command works</p></li>
            </ol>
        </section>

        <h4>Start and configuration</h4>
        <section class="text">
            <p>Start the application</p>
            <p>--help and cmd -h</p>
            <p>show configClass</p>
            <p>configClass set sampledirectory</p>
            <p>configClass set projectdirectory</p>
            <p>configClass set maxoccurdir</p>
            <p>configClass set maxrandom</p>
        </section>

        <h4>Scan your samples directory</h4>
        <section class="text">
            <p>most important step</p>
            <p>scan</p>
            <p>scan -f in the future</p>
            <p>lookup bass</p>
        </section>

        <h4>Ready!</h4>
        <section class="text">
            <p>now you are ready to work with SAMM</p>
            <p>open your DAW and use SAMM to find samples</p>
        </section>

        <h4>Lookup query</h4>
        <section class="text">
            <p>lookup bass</p>
            <p>lookup bass -a</p>
            <p>lookup bass+rock</p>
            <p>lookup bass+rock,bass+electro,bass+loop</p>
            <p>If the results are not enough for you, change the values of MaxDirOccur and MaxRandom</p>
        </section>

        <h4>Lookup with labels</h4>
        <section class="text">
            <p>Don't waste your time in writing a big query everytime. Store a labeled query!</p>
            <p>configure set Tags rockbass bass+rock,bass+electro,bass+loop+rock</p>
            <p>lookup -t rockbass</p>
            <p>You can check the coverage of your labels with command 'coverage' (see doc)</p>
        </section>

        <h4>Save the samples</h4>
        <section class="text">
            <p>Did you configure the directory of your project you are working to?</p>
            <p>configure set project /abc/ndns/</p>
            <p>save - that's it - it saves in /yourproject/samm/rockbass the samples found in your latest lookup</p>
            <p>save -d customname</p>
        </section>


        <h4>More features?</h4>
        <section class="text">
            <p>we are working to fix the bugs</p>
            <p>see the documentation below for other useful features</p>
        </section>
    </section>

    <section>
        <h2>Documentation</h2>

        <?php include('sections/command/guide_config.php'); ?>

        <?php include('sections/command/guide_coverage.php'); ?>

        <?php include('sections/command/guide_lookup.php'); ?>

        <?php include('sections/command/guide_save.php'); ?>

        <?php include('sections/command/guide_scan.php'); ?>

        <?php include('sections/command/guide_show.php'); ?>

        <?php include('sections/command/guide_dir.php'); ?>

    </section>

</section>

<footer>
    <div>info info info</div>
    <div>lib credits</div>
</footer>

</body>
</html>
