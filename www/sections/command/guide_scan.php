
        <section class="command" <?php $TemplateMgr->printCommandID('scan'); ?>>
            <h3>scan</h3>
            <section class="text">
                <p class="code">
                    mpl$ scan
                </p>
                <p>
                    Perform a full scan of the samples directory and create the full index of the files.
                    In order to avoid resource wasting, if the index is already present the scan does not start.
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
