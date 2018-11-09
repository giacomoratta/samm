
        <section class="command" id="cmd_config">
            <h3>config</h3>
            <section class="text">
                <p class="code">
                    mpl$ config
                </p>
                <p>
                    Save the samples found with the latest lookup inside the <?php $TemplateMgr->printCfgParamLink('Project','project directory'); ?>;
                    create the directory <?= $TemplateMgr->mpl_save_directory ?> if it does not already exist.
                </p>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('set parameters','set <name> [values...]'); ?>
                    <p class="code">
                        mpl$ set Project /musicprojects/project1
                    </p>
                    <section class="text">
                        <p>
                            Set the value of a configuration parameter.
                        </p>
                    </section>

                    <section class="detail" id="<?php $TemplateMgr->printCfgParamID('Project'); ?>">
                        <?php $TemplateMgr->printOptionDetail('SamplesDirectory','set <name> [values...]'); ?>
                        <section class="text">
                            <p>
                                Set the value of a configuration parameter.
                            </p>
                            <p class="code">
                                mpl$ set Project /musicprojects/project1
                            </p>
                        </section>
                    </section>

                </section>

            </section>
        </section>
