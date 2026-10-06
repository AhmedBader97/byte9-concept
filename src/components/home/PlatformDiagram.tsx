import { InView } from '@/components/motion/InView';

/**
 * How Blaze fits together: teams work in the Page Builder, Blaze serves content
 * and commerce over GraphQL, the audience gets a fast server-rendered site,
 * and existing commerce, data and cloud services plug in underneath.
 */
export function PlatformDiagram() {
  return (
    // Data flows along the connectors while the diagram is on screen.
    <InView repeat className="platform-motion">
    <figure className="platform">
      <figcaption className="u-visually-hidden">
        Diagram: your teams use the Blaze Page Builder; Blaze delivers content and commerce through a GraphQL API to a
        server-rendered React site, search and personalised ads; commerce, data and cloud services connect underneath.
      </figcaption>

      <div className="platform__flow">
        <section className="platform__node platform__node--teams">
          <h3 className="platform__heading">Your teams</h3>
          <ul className="platform__list">
            <li>Editors</li>
            <li>Marketers</li>
            <li>Commercial teams</li>
          </ul>
          <p className="platform__note">Build and change pages without code</p>
        </section>

        <section className="platform__node platform__node--core">
          <h3 className="platform__heading">Blaze</h3>
          <ol className="platform__stack">
            <li>No-code Page Builder</li>
            <li>GraphQL content and commerce API</li>
            <li>Plugins: Sphere, analytics, ad serving</li>
          </ol>
        </section>

        <section className="platform__node platform__node--audience">
          <h3 className="platform__heading">Your audience</h3>
          <ul className="platform__list">
            <li>Fast, server-rendered React site</li>
            <li>Elasticsearch-powered search</li>
            <li>Personalised content and ads</li>
          </ul>
        </section>
      </div>

      <div className="platform__base">
        <section className="platform__service">
          <h3 className="platform__service-title">Commerce</h3>
          <p>Shopware, Oracle NetSuite Commerce, WooCommerce</p>
        </section>
        <section className="platform__service">
          <h3 className="platform__service-title">Data</h3>
          <p>Snowplow, Mapp, Segment, BigQuery</p>
        </section>
        <section className="platform__service">
          <h3 className="platform__service-title">Cloud</h3>
          <p>AWS serverless, Terraform, Datadog</p>
        </section>
      </div>
    </figure>
    </InView>
  );
}
