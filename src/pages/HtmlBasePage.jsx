import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';

function HtmlBasePage({ pautaEnabled = false, tableEnabled = false }) {
  return (
    <section className="bg-background">
      <Helmet>
        <title>Pàgina HTML base · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Pàgina base amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        topOffset="0px"
        bottomPadding="0px"
      />
    </section>
  );
}

export default HtmlBasePage;
