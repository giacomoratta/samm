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
    <h1>MPL: a creativity-oriented samples manager</h1>
    <section class="whatis">
        <p>
            MPL (<i>&quot;Music Production Library&quot;</i>) is a command line based software
            which helps your creativity flow. Dive into your wide samples library,
            make researchs, extract random samples and save them into the current project directory.
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

    <div class="download">
        <a href="#" class="download_button">
            <span class="tx">Download latest version for OS [beta]</span>
            <br/>
            <span class="fn">mpl.0.1.0.mac.x64.zip</span>
        </a>
    </div>
    <div class="releases_history">
        <a href="#">Releases history</a>
    </div>
</header>

<section class="central_container">

    <div class="ideasbehind">
        <h2>The ideas behind the MPL project</h2>
        <section class="text">
            <p>
                <strong>Save your creativity flow!</strong> MPL avoid wasting your time dealing with hundred of samples
                inside many nested directories. With MPL you just ask!
            </p>
            <p>
                <strong>Improve your creativity with randomness!</strong> MPL does not care about how you organize your samples.
                MPL selects samples randomly based on detailed queries. Sometime you will <strong>find old-but-gold samples</strong>
                again or <strong>some good unwanted samples</strong> which for some reasons matched the query.
            </p>
            <p>
                <strong>Why this <i>nerd</i> interface?</strong> Don't be afraid about the command line: it's easy, it's fast, it's light.
                It does not waste CPU and RAM: these are necessary for your DAW!
            </p>
        </section>
    </div>

    <section>
        <h2>Getting started</h2>

        <h4>Installation</h4>
        <section class="text">
            <ol>
                <li><p>Download the application</p></li>
                <li><p>Unzip the application in a folder</p></li>
                <li><p>Add the path to the environment variable PATH</p></li>
                <li><p>Close and open the console</p></li>
            </ol>
        </section>

        <h4>Start and configuration</h4>
        <section class="text">
            <p>Start the application</p>
            <p>--help and cmd -h</p>
            <p>show config</p>
            <p>config set sampledirectory</p>
            <p>config set projectdirectory</p>
            <p>config set maxoccurdir</p>
            <p>config set maxrandom</p>
        </section>

        <h4>Indexes your samples directory</h4>
        <section class="text">
            <p>most important step</p>
            <p>scan</p>
            <p>scan -f in the future</p>
            <p>lookup bass</p>
        </section>

        <h4>Ready!</h4>
        <section class="text">
            <p>now you are ready to work with MPL</p>
            <p>open your DAW and use MPL to find samples</p>
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
            <p>save - that's it - it saves in /yourproject/mpl/rockbass the samples found in your latest lookup</p>
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
        <section class="text">
            <p>menu with descriprions and anchors</p>
        </section>

        <section class="command">
            <h3>coverage</h3>
            <section class="text">
                <p class="code">
                    mpl$ coverage
                </p>
                <p>
                    Check how many samples are covered by the queries stored in the configuration or by an inline query;
                    then prints the uncovered samples.
                </p>
                <p>
                    By analysing the uncovered samples it is possible to add or modify configured queries in order
                    to match more samples inside the collections. If many uncovered samples are left, the search results
                    will be incomplete and some samples could be never used.
                </p>
                <p>
                    <strong>Default behaviour.</strong> It works with Samples Directory and tagged queries (see Configuration).
                    For each tagged query, this command prints how many samples are covered.
                    At the end, it prints the list of uncovered samples.
                </p>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('custom absolute path','-p, --path <path>'); ?>
                    <p class="code">
                        mpl$ command -p "/Users/default/Downloads/New Samples Big Pack"
                    </p>
                    <section class="text">
                        <p>
                            Let's suppose that you bought hundred of new samples. Before addind them to your samples collection
                            you may want see if they are well covered by your tagged queries and which ones are uncovered.
                            After that you can fix your configured tagged queries.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('custom query','-q, --query <query>'); ?>
                    <section class="text">
                        <p>
                            Checks the coverage provided by the custom query instead of working with configured tagged queries.
                        </p>
                        <p class="code">
                            mpl$ command -q tag1+tag2,tag3
                        </p>
                    </section>
                </section>

            </section>
        </section>

        <section class="command">
            <h3>command title</h3>
            <section class="text">
                <p>...abc...</p>
                <div class="code">
                    mpl$ command opz 23
                </div>
                <p>...abc...</p>
                <h5>same font-size bold margin</h5>
                <p>...abc...</p>

                <section class="option">
                    <h4>option title</h4>
                    <section class="text">
                        <p>...abc...</p>
                        <div class="code">
                            mpl$ command opz 23
                        </div>
                        <p>...abc...</p>
                        <p>...abc...</p>
                    </section>
                </section>

            </section>
        </section>
    </section>

</section>

<footer>
    <div>info info info</div>
    <div>lib credits</div>
</footer>

</body>
</html>