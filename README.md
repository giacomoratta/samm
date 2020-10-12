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


<section id="download-and-install">
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
After the <a href="#download-and-install">preliminary steps</a>, you should be able to run the command <code>samm</code>.

<h4>1. Essential config</h4>
<p>The only thing you need is to set the samples directory: <code>config SamplesDirectory "/home/user123/my samples dir/"</code> (" included)</p>
<p>Curious about all the configuration parameters? The command <code>config</code> shows all the parameters, their descriptions and the current value.</p>
<p>Hint: if you start typing <code>config Sampl</code>, press TAB and you will get the auto-completion.</p>

<h4>2. First sample scan</h4>
<p>In order to be able to run a search, all your samples need to be indexed; this process is important to avoid wasting pc resources and slow searches.</p>
<p>Run <code>samples-scan</code> and wait some seconds.</p>
<p>If you need to re-index, run <code>samples-scan -f</code> (-f means 'force')</p>

<h4>3. Set current project</h4>
<p>Where will the samples be imported? Inside your project directory!</p>
<p>So, get the full path of your current project and run the command <code>project "/home/user123/music-projects/project1"</code> (" included)</p>

<h4>4. Look and export</h4>
<p>Finally, everything is ready to search and import samples!</p>
<p>I guess all of us have some kicks, right? So, run <code>look kick</code>.</p>
<p>The result should be a short and random list of 'kick' samples. If you run again, you will get a different list!</p>
<p>Last step is to import these samples into your project; run <code>look-export</code> or <code>look-export kick-set1</code> (for a custom directory name), and answer 'y'.</p>
<p>Now, go back to your project, focus on this small sub-set of samples, and try to use them!</p>

<h4>5. Set and use queries for look</h4>
<p>For a more complex results, you need to write a query.</p>
<p>This application just uses human readable queries: comma (,) is OR and plus (+) is AND. Let's see some examples:</p>
<ul>
    <li><code>look kick,kick+dark,kc+raw</code> = all samples inside a full path which contains the words 'kick', OR 'kick' and 'dark', OR 'kc' AND 'raw'.</li>
    <li><code>look bass+moog,bass+303</code> = all samples inside a full path which contains the words 'bass' AND 'moog', OR 'bass' AND '303'.</li>
</ul>
<p><a href="#appendix-b---how-queries-works">See Appendix B, for more details about queries</a></p>

<h4>6. Switch the project</h4>
<p>If you want to switch to another project in the same directory (e.g. /home/user123/music-projects/), run <code>project-list</code></p>
<p>If you want to switch to a previous project, run <code>project-history</code></p>

<h4>7. Tune the sample scan</h4>
<p>Do you want more random samples?</p>
<p>Do you want to exclude some extensions or include only specific ones?</p>
<p>Do you want to exclude some directories?</p>
<p>Check the command <code>config</code> inside the Reference section.</p>

</section>

<section id="reference">
<h2>Commands reference</h2>

<h3><code>config [options] [name] [values...]</code></h3>
<p>Get or set the value of a configuration parameter.</p>

<table>
 <tr>
    <td><strong>SamplesDirectory</strong></td>
    <td>directory with samples to scan and search in (absolute path). <br/>
        <code>config SamplesDirectory "C:\all samples\"</code></td>
 </tr>
 <tr>
    <td><strong>LookRandomCount</strong></td>
    <td>maximum number of random samples selected after a search. <br/>
        <code>config LookRandomCount 15</code></td>
 </tr>
 <tr>
    <td><strong>LookRandomSameDirectory</strong></td>
    <td>maximum number of samples from the same directory, to avoid too many samples from the same family. <br/>
        <code>config LookRandomSameDirectory 2</code></td>
 </tr>
 <tr>
    <td><strong>SamplesDirectoryExclusions</strong></td>
    <td>wirectories which must be skipped during the scan process of samples directory; these paths are relative to SamplesDirectory path; add or remove (with -r option) multiple values. <br/>
        <code>config SamplesDirectoryExclusions /manuals /samplesABC/legacy</code> <br>
        <code>config SamplesDirectoryExclusions -r /manuals</code>
    </td>
 </tr>
 <tr>
    <td><strong>ExcludedExtensionsForSamples</strong></td>
    <td>the list of file extensions to skip during the sample scan; add or remove (with -r option) multiple values. <br/>
        <code>config ExcludedExtensionsForSamples exe txt</code> <br>
        <code>config ExcludedExtensionsForSamples -r exe</code>
    </td>
 </tr>
 <tr>
    <td><strong>IncludedExtensionsForSamples</strong></td>
    <td>the list of file extensions which samples must have; add or remove (with -r option) multiple values. <br/>
        <code>config IncludedExtensionsForSamples wav mp3</code> <br>
        <code>config IncludedExtensionsForSamples -r wav</code>
    </td>
 </tr>
 <tr>
    <td><strong>ExtensionsPolicyForSamples</strong></td>
    <td>policy for sample scan: 'I' to get files with declared extensions only, 'E' to exclude file with some extensions, and 'X' to disable the extension filter. <br/>
        <code>config ExtensionsPolicyForSamples I</code>
    </td>
 </tr>
 <tr>
    <td><strong>TemplatesDirectory</strong></td>
    <td>directory where all templates are located; they can be used to start a ready-to-go project instead of an empty one. <br/>
        <code>config TemplatesDirectory "C:\my templates\"</code>
    </td>
 </tr>
</table>

<h3><code>bookm [options] [label]</code></h3>
<p>Show or manage the bookmarks.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-c, --copy &lt;new-label&gt;</code></td>
    <td>copy the bookmarks in a new label or merge in an existent label.</td>
 </tr>
 <tr>
    <td><code>-i, --info</code></td>
    <td>show more info</td>
 </tr>
 <tr>
    <td><code>-l, --label &lt;new-label&gt;</code></td>
    <td>change the label of a bookmark set</td>
 </tr>
 <tr>
    <td><code>-r, --remove [indexes]</code></td>
    <td>remove an entire label or some bookmarks by indexes (e.g. '3,5,7')</td>
 </tr>
</table>

<h3><code>bookm-export [options] [label]</code></h3>
<p>Export all bookmarks to current project or to a custom path.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-p, --path</code></td>
    <td>custom destination path.</td>
 </tr>
</table>

<h3><code>bookm-look</code></h3>
<p>Add bookmarks from latest lookup.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
</table>

<h3><code>look [options] [query]</code></h3>
<p>Search samples by query or show the latest sample look; (related configurations: LookRandomCount, LookRandomSameDirectory).</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-i, --info</code></td>
    <td>Show more info</td>
 </tr>
 <tr>
    <td><code>-l, --label &lt;label&gt;</code></td>
    <td>Use a query label (see 'query' command)</td>
 </tr>
</table>

<h3><code>look-export [options] [dirname]</code></h3>
<p>Export the latest samples look in the current project; the optional parameter 'dirname' is the name of destination directory.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-o, --overwrite</code></td>
    <td>overwrite the destination directory if exists</td>
 </tr>
 <tr>
    <td><code>-p, --path &lt;custom-path&gt;</code></td>
    <td>save latest lookup to current project directory or custom path</td>
 </tr>
</table>

<h3><code>project [path]</code></h3>
<p>Shows some information about the current project or set current project from its absolute path.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
</table>

<h3><code>project-history [options]</code></h3>
<p>Show all project history or set the current project from one of them.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-d, --date</code></td>
    <td>order by date of latest change</td>
 </tr>
 <tr>
    <td><code>-n, --name</code></td>
    <td>order by name</td>
 </tr>
</table>


<h3><code>project-list [options]</code></h3>
<p>Show all projects in the same parent directory or set the current project from of them.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-d, --date</code></td>
    <td>order by date of latest change</td>
 </tr>
</table>

<h3><code>project-template</code></h3>
<p>Show all templates or create a new project from one of them.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
</table>

<h3><code>query [options] [label] [query]</code></h3>
<p>Manage queries for sample, for matching sample directories and files. In order to add, get or remove a query, use the 2 params label and query.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-c, --copy &lt;label&gt;</code></td>
    <td>duplicate a query with the specified label</td>
 </tr>
 <tr>
    <td><code>-l, --label &lt;label&gt;</code></td>
    <td>change the label with the specified label</td>
 </tr>
 <tr>
    <td><code>-r, --remove</code></td>
    <td>remove a query</td>
 </tr>
</table>

<h3><code>samples-scan [options]</code></h3>
<p>Perform a full scan of the samples directory and create the index; if the index is already present the scan does not start, in order to avoid resource wasting.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-f, --force</code></td>
    <td>force the rescan</td>
 </tr>
</table>
                                       
<h3><code>search [options] [query]</code></h3>
<p>Search samples by query or show the latest search results.</p>
<table>
 <tr>
    <td><code>--help</code></td>
    <td>output usage information</td>
 </tr>
 <tr>
    <td><code>-l, --label &lt;label&gt;</code></td>
    <td>use a query label (see 'query' command)</td>
 </tr>
</table>

</section>


<section id="appendix-a">
<h2>Appendix A - How to add a path to PATH environment variable</h2>
<p>The following steps will show how to install this software in order to be run in your terminal with the simple command <code>samm</code>. In other words, at the end of these steps, you will be able to open a terminal, type "samm" and start the software.</p>

<h3>Windows</h3>
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

<h3>Mac</h3>
<ol>
    <li>Copy the directory <code>samm.0.1.0.mac-x64</code> in your software or documents directory.</li>
    <li>Get the absolute path like <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Edit the file <code>/etc/paths</code> in admin mode, e.g. <code>sudo nano /etc/paths</code>.</li>
    <li>Add the absolute path at the end of this file, so new line with <code>/home/user123/software/samm.0.1.0.mac-x64</code>.</li>
    <li>Save the changes.</li>
    <li>Close your terminal and open again: you should be able to run the command <code>samm</code>.</li>
</ol>

<h3>Linux</h3>
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


<section id="appendix-b---how-queries-works">
<h2>Appendix B - How queries works</h2>
<p>The queries used by this software are really simple: a combination of AND/OR conditions, where AND is "+" (plus), and OR is "," (comma).</p>
<p><strong>How queries are matched?</strong> A query will match a sample if the sample file or it whole path has some of the words stated in the query (of course, if the path matches the query conditions AND/OR). This way, we can <strong>keep the sample-pack as it is!</strong></p>
<p><strong>Example #1</strong>. Search for a raw kick, so "kick" AND "raw": <code>kick+raw</code>.</p>
<p><strong>Example #2</strong>. Search for a "guitar" OR "string": <code>guitar,string</code>.</p>
<p><strong>Example #3</strong>. Search for a raw kick OR deep tom: "kick+raw,deep+tom".</p>
</section>
