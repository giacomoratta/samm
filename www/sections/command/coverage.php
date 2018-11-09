
        <section class="command" id="cmd_coverage">
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
                        mpl$ coverage -p "/Users/default/Downloads/New Samples Big Pack"
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
                    <p class="code">
                        mpl$ coverage -q kick+808,sub
                        <br/>//query: ('kick' AND '808') OR ('sub')
                    </p>
                    <section class="text">
                        <p>
                            Checks the coverage provided by the custom query instead of working with configured tagged queries.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('single tag','-t, --tag <label>'); ?>
                    <p class="code">
                        mpl$ coverage -t hihat
                    </p>
                    <section class="text">
                        <p>
                            Checks the coverage provided by one of the configured tagged query.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('progressive output','-g, --progressive'); ?>
                    <p class="code">
                        mpl$ coverage -p
                    </p>
                    <section class="text">
                        <p>
                            Print the output gradually.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('shows covered samples','-a, --allinfo'); ?>
                    <p class="code">
                        mpl$ coverage -a
                    </p>
                    <section class="text">
                        <p>
                            By default, the covered samples are not shown because they could be too many.
                            With this option it is possible to show them also.
                            Hovewer, since the output would be very confusing, the option <span class="code">--progressive</span>
                            is set automatically in order to read the output step-by-step.
                        </p>
                    </section>
                </section>

            </section>
        </section>
