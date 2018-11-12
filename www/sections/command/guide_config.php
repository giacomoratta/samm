
        <section class="command" id="cmd_config">
            <h3>config</h3>
            <section class="text">
                <p class="code">
                    mpl$ config
                </p>
                <p>
                    Manage the configuration of the whole application.
                </p>

                <section class="option">
                    <h4>Parameters list</h4>
                    <section class="detail">
                        <p <?php $TemplateMgr->printCfgParamID('samplesdirectory'); ?>>
                            <label>SamplesDirectory: </label>
                            <span>absolute path to the directory of samples collection.</span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('project'); ?>>
                            <label>Project: </label>
                            <span>absolute path to the current project (where the imported samples directory will be created).</span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('randomcount'); ?>>
                            <label>RandomCount: </label>
                            <span>number of random samples selected by the <?php $TemplateMgr->printCommandLink('lookup','lookup command'); ?>.</span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('maxoccurrencessamedirectory'); ?>>
                            <label>MaxOccurrencesSameDirectory: </label>
                            <span>number of random samples selected by the <?php $TemplateMgr->printCommandLink('lookup','lookup command'); ?>
                                which can belong to the same directory. The lower value the higher randomness.
                                The lookup command will increase this value if not enought samples are found in order
                                to guarantee the <?php $TemplateMgr->printCfgParamLink('randomcount','RandomCount'); ?> value.
                            </span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('tags'); ?>>
                            <label>Tags: </label>
                            <span>Set or unset a tagged query.</span>
                            <span>To store a tagged query the command needs of the label and the query</span>
                            <span class="code">mpl$ config set Tag housekick kick+house,kick+808,kick+old</span>.
                            <span>To delete a tagged query the command needs of the label only</span>
                            <span class="code">mpl$ config set Tag housekick</span>.
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('includedextensionsforsamples'); ?>>
                            <label>IncludedExtensionsForSamples: </label>
                            <span>Define which extensions should be taken in consideration by commands
                                <?php $TemplateMgr->printCommandLink('scan','scan'); ?> and
                                <?php $TemplateMgr->printCommandLink('lookup','lookup'); ?>.
                                In this case only files with these extensions will be taken.
                                To use this filter set the parameter
                                <?php $TemplateMgr->printCfgParamLink('extensioncheckforsamples','ExtensionCheckForSamples'); ?>.
                            </span>
                            <br/>
                            <span>Add extension:</span> <span class="code">mpl$ config set IncludedExtensionsForSamples wav (or .wav)</span>
                            <br/>
                            <span>Remove extension:</span> <span class="code">mpl$ config set IncludedExtensionsForSamples !wav (or !.wav)</span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('excludedextensionsforsamples'); ?>>
                            <label>ExcludedExtensionsForSamples: </label>
                            <span>Define which extensions should NOT be taken in consideration by commands
                                <?php $TemplateMgr->printCommandLink('scan','scan'); ?> and
                                <?php $TemplateMgr->printCommandLink('lookup','lookup'); ?>.
                                In this case only files without these extensions will be taken.
                                To use this filter set the parameter
                                <?php $TemplateMgr->printCfgParamLink('extensioncheckforsamples','ExtensionCheckForSamples'); ?>.
                            </span>
                            <br/>
                            <span>Add extension:</span> <span class="code">mpl$ config set ExcludedExtensionsForSamples txt (or .txt)</span>
                            <br/>
                            <span>Remove extension:</span> <span class="code">mpl$ config set ExcludedExtensionsForSamples !txt (or !.txt)</span>
                        </p>
                        <p <?php $TemplateMgr->printCfgParamID('extensioncheckforsamples'); ?>>
                            <label>ExtensionCheckForSamples: </label>
                            <span>Define how the application should filter the samples based on their extensions.
                                Allowed values: X (filter disabled), E (exclude extensions), I (select only included extensions).</span>
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('set parameters','set <name> [values...]'); ?>
                    <p class="code">
                        mpl$ config &lt;name&gt; [values...]
                        <br/>mpl$ config set Project /musicprojects/project1
                        <br/>mpl$ config set Tag tag-label query,tag+tag2,or,tag3
                    </p>
                    <section class="text">
                        <p>
                            Set the value of a configuration parameter: parameters can be chosen with autocomplete function (use tab).
                            Some parameters require other details.
                        </p>
                    </section>
                </section>

            </section>
        </section>

