
        <section class="command" <?php $TemplateMgr->printCommandID('dir'); ?>>
            <h3>dir</h3>
            <section class="text">
                <p class="code">
                    mpl$ dir &lt;action&gt;
                </p>
                <p>
                    Utilities to dive and work with the SAMM directories (e.g. Samples, Project, etc.).
                    By default, it access the samples directory and each files inside it.
                </p>

                <?php $TemplateMgr->printCommandOption('extensions','$ dir ext'); ?>
                <section class="text">
                    <p>
                        Shows the full list of extensions and useful stats.
                    </p>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('specified extension','-e, --extension <name>'); ?>
                    <p class="code">
                        mpl$ dir ext -e exe
                    </p>
                    <section class="text">
                        <p>
                            Show the full list of file with the specified extension.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('internal index','-i, --index'); ?>
                    <p class="code">
                        mpl$ dir ext -i
                        mpl$ dir ext -i -e exe
                    </p>
                    <section class="text">
                        <p>
                            Works with the internal samples index instead of accessing the file system.
                        </p>
                    </section>
                </section>

            </section>
        </section>
