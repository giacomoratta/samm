
        <section class="command" <?php $TemplateMgr->printCommandID('dir'); ?>>
            <h3>dir</h3>
            <section class="text">
                <p class="code">
                    mpl$ dir &lt;action&gt;
                </p>
                <p>
                    Utilities to dive and work with the MPL directories (e.g. Samples, Project, etc.).
                </p>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('force scan','-f, --force'); ?>
                    <p class="code">
                        mpl$ scan -f
                    </p>
                    <section class="text">
                        <p>
                            Force the re-scan and create the samples index again.
                        </p>
                    </section>
                </section>

            </section>
        </section>
