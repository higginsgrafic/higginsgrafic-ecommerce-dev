import SEO from '@/components/SEO';
import UnderConstructionEditor from '@/components/UnderConstructionEditor';

export default function ECConfigPage() {
  return (
    <>
      <SEO
        title="Gestor de Pàgina 'En Construcció'"
        description="Gestiona la pàgina 'En Construcció' amb textos, imatges i vídeos personalitzats"
      />

      <div className="h-screen bg-paper-soft overflow-hidden debug-exempt" data-debug-exempt>
        <UnderConstructionEditor />
      </div>
    </>
  );
}
