
        <section class="command" <?php $TemplateMgr->printCommandID('lookup'); ?>>
            <h3>lookup</h3>
            <section class="text">
                <p class="code">
                    mpl$ lookup [query]
                    <br/>mpl$ lookup bass+loop,bass+rock+deep
                </p>
                <p>
                    Run a search inside the samples collection and print out a random selection of the founded samples.
                    The results depends on these configuration parameters: <?php $TemplateMgr->printCfgParamLink('LookRandomCount','LookRandomCount'); ?>
                    and <?php $TemplateMgr->printCfgParamLink('MaxOccurrencesSameDirectory','MaxOccurrencesSameDirectory'); ?>.
                </p>
                <p>
                    <strong>How the matching works.</strong>
                    MPL looks for a matching between the specified query (and its single words) and the relative path
                    of each samples inside the collection. The relative path starts from the
                    <?php $TemplateMgr->printCfgParamLink('SamplesDirectory','samples directory'); ?>.
                </p>
                <p>
                    <strong>How to write a query.</strong>
                    Basically, the query is a combination of AND and OR operators respectively '+' and ','.
                    The following query:
                </p>
                <p class="code">
                    mpl$ lookup bass+loop,bass+rock+deep
                </p>
                <p>
                    is translated as:
                </p>
                <p class="code">
                    ( 'bass' AND 'loop' ) OR ( 'bass' AND 'rock' AND 'deep' )
                </p>


                <section class="option">
                    <?php $TemplateMgr->printCommandOption('use tagged query','-t, --tag <label>'); ?>
                    <p class="code">
                        mpl$ lookup -t raw_kicks
                    </p>
                    <section class="text">
                        <p>
                            Use a configured <?php $TemplateMgr->printCfgParamLink('Tags','tagged query'); ?>
                            instead of writing a new query every time.
                        </p>
                    </section>
                </section>

                <section class="option">
                    <?php $TemplateMgr->printCommandOption('print all samples','-a, --all'); ?>
                    <p class="code">
                        mpl$ lookup -a
                    </p>
                    <section class="text">
                        <p>
                            Use a configured <?php $TemplateMgr->printCfgParamLink('Tags','tagged query'); ?>
                            instead of writing a new query every time.
                        </p>
                    </section>
                </section>

            </section>
        </section>
