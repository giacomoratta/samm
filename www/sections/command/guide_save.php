
        <section class="command" <?php $TemplateMgr->printCommandID('save'); ?>>
            <h3>save</h3>
            <section class="text">
                <p class="code">
                    mpl$ save
                </p>
                <p>
                    Save the samples found with the latest lookup inside the <?php $TemplateMgr->printCfgParamLink('Project','project directory'); ?>;
                    create the directory <?= $TemplateMgr->mpl_save_directory ?> if it does not already exist.
                </p>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('custom directory name','-d, --dirname <dirname>'); ?>
                    <p class="code">
                        mpl$ coverage -d bass_loop
                    </p>
                    <section class="text">
                        <p>
                            By default, the directory name is set based on the tags used in the query string.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('custom destination absolute path','-p, --path <path>'); ?>
                    <p class="code">
                        mpl$ coverage -p /save/my/samples/outside
                    </p>
                    <section class="text">
                        <p>
                            Save the samples in a custom external directory instead of saving them in the project directory.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('overwrite the existing directory','-o, --overwrite'); ?>
                    <p class="code">
                        mpl$ coverage -o
                    </p>
                    <section class="text">
                        <p>
                            By default, if the destination directory already exists, SAMM appends a numeric suffix.
                            If the existent directory is not necessary anymore can be overwritten with this command.
                        </p>
                    </section>
                </section>

            </section>
        </section>
