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
    <div class="whatis">
        <p>
            MPL (<i>&quot;Music Production Library&quot;</i>) is a command line based software
            which helps your creativity flow. Dive into your big samples library,
            make researchs, extract random samples and save them into the current project directory.
        </p>
        <p>
            Don't be afraid about the command line: it's easy, it's fast, it's light.
            It does not waste CPU and RAM: these are necessary for your DAW!
        </p>
    </div>
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

    <section>
        <h2>Getting started</h2>

        <h4>Installation</h4>
        <section class="text">
            <p>Download the application</p>
            <p>Unzip the application in a folder</p>
            <p>Add the path to the environment variable PATH</p>
            <p>Close and open the console</p>
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
            <p>...abc...</p>
        </section>

        <section class="command">
            <h3>command title</h3>
            <section class="text">
                <p>...abc...</p>
                <div class="code_syntax">
                    mpl$ command opz 23
                </div>
                <p>...abc...</p>
                <h5>same font-size bold margin</h5>
                <p>...abc...</p>

                <section class="option">
                    <h4>option title</h4>
                    <section class="text">
                        <p>...abc...</p>
                        <div class="code_syntax">
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