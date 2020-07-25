<section id="whatis">
<p>
    SAMM is a command line based software which helps and preserve your creativity flow. Dive into your wide samples library, make researches, extract random samples and save them into the current project directory.
</p>
<blockquote>In a couple of minutes... ask for samples, import in your project directory, use them!</blockquote>
</section>


<section id="principles">
<h2>Principles</h2>
<ol>
    <li><strong>Save your creativity flow.</strong> SAMM avoid you wasting your time dealing with hundred of samples inside many nested directories. Just ask.</li>
    <li><strong>Improve your creativity with randomness.</strong> SAMM does not care about how you organize your samples. MPL selects samples randomly based on simple human-readable queries. (It will be funny to find some <i>old-but-good</i> samples or weird samples which you would have never chosen).</li>
    <li><strong>Easy, fast and light interface to avoid CPU and RAM wastefulness</strong>. Don't be afraid about the command line and let's save CPU and RAM for the DAW.</li>
</ol>
</section>


<section id="download-install">
<h2>Download and install</h2>
<ol>
    <li>Download the zip package and extract.</li>
    <li>Copy the directory <code>samm.0.1.0.win-x64</code> in your software or documents directory.</li>
    <li>Add the absolute path of this directory to your PATH environment variable (see <a href="#appendix-a">Appendix A</a>)</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>
</section>


<section id="get-started">
<h2>Get started</h2>
Simple steps you need to start using SAMM in few minutes; to do more see <a href="#reference">all commands reference</a>.

<h4>Essential config</h4>
<h4>First sample scan</h4>
<h4>Set current project</h4>
<h4>Look and export</h4>
<h4>Set and use queries for look</h4>
<h4>Tune the sample scan</h4>
</section>

<section id="reference">
<h2>Commands reference</h2>

<h4>config</h4>
<h4>bookm</h4>
<h4>bookm-export</h4>
<h4>bookm-look</h4>
<h4>look</h4>
<h4>look-export</h4>
<h4>project</h4>
<h4>project-history</h4>
<h4>project-list</h4>
<h4>project-template</h4>
<h4>query</h4>
<h4>sample-scan</h4>
<h4>search</h4>
</section>


<section id="appendix-a">
<h2>Appendix A - How to add a path to PATH environment variable</h2>
The following steps will show how to install this software in order to be run in your terminal with the simple command <code>samm</code>.

<h4>Windows</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.win-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>C://Programs//samm.0.1.0.win-x64</code>.</li>
    <li>Go to <strong>System Properties</strong>, click the Advanced tab, and then click Environment Variables..</li>
    <li>In the <strong>System Variables</strong> section, highlight Path, and click Edit.</li>
    <li>In the Edit System Variables window, insert the cursor at the end of the Variable value field.</li>
    <li>If the path contains spaces, wrap it with double quotes, e.g. <code>"C://Program Data//samm.0.1.0.win-x64"</code>.</li>
    <li>If the last character is not a semi-colon (;), add one.</li>
    <li>After the final semi-colon, type the absolute path (e.g. <code>C://Programs//samm.0.1.0.win-x64</code>).</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>

<h4>Mac</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.mac-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Edit the file <code>/etc/paths</code> in admin mode, e.g. <code>sudo nano /etc/paths</code>.</li>
    <li>Add the absolute path at the end of this file, so new line with <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Save the changes.</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>

<h4>Linux</h4>
<ol>
    <li>Copy the directory <code>samm.0.1.0.linux-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>/home/user123/software/samm.0.1.0.linux-x64</code>.</li>
    <li>Edit the file <code>.bashrc</code> in your home: e.g. <code>nano ~/.bashrc</code>.</li>
    <li>Add the following line at the end: <code>PATH=$PATH:the-absolute-path</code>, e.g. <code>PATH=$PATH:/home/user123/software/samm.0.1.0.linux-x64</code>.</li>
    <li>If the path contains spaces, wrap it with double quotes, e.g. <code>"/home/user123/music software/samm.0.1.0.linux-x64"</code>.</li>
    <li>Save the changes.</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>
</section>


<section id="appendix-b">
<h4>Appendix B - First time with a CLI?</h4>
<p>This section is for who has never used a command line interface.</p>
<ol>
    <li>Path with spaces: always wrap it in double quotes otherwise only the first part will be considered; e.g. <code>"C://Program Data//samm.0.1.0.win-x64"</code>.</li>
</ol>
</section>


<section id="appendix-c">
<h4>Appendix C - How queries works</h4>
<p>This section is for who has never used a command line interface.</p>
<ol>
    <li>Path with spaces: always wrap it in double quotes otherwise only the first part will be considered; e.g. <code>"C://Program Data//samm.0.1.0.win-x64"</code>.</li>
</ol>
</section>
