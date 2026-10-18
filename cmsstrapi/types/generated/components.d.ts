import type { Schema, Struct } from '@strapi/strapi';

export interface HomeValue extends Struct.ComponentSchema {
  collectionName: 'components_home_values';
  info: {
    description: 'O valoare a bisericii: iconi\u021B\u0103 + titlu + text scurt (sec\u021Biunea \u201ECe ne define\u0219te\u201D)';
    displayName: 'Valoare';
    icon: 'star';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      [
        'bible',
        'community',
        'hope',
        'health',
        'prayer',
        'love',
        'service',
        'music',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'hope'>;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageFaq extends Struct.ComponentSchema {
  collectionName: 'components_page_faqs';
  info: {
    description: '\u00CEntrebare + r\u0103spuns (apare \u0219i \u00EEn Google ca rezultat FAQ)';
    displayName: '\u00CEntrebare frecvent\u0103';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageHighlight extends Struct.ComponentSchema {
  collectionName: 'components_page_highlights';
  info: {
    description: 'Card scurt: iconi\u021B\u0103 + titlu + text';
    displayName: 'Highlight';
    icon: 'bulletList';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      [
        'welcome',
        'clock',
        'location',
        'parking',
        'kids',
        'dress',
        'language',
        'music',
        'book',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'welcome'>;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProjectEnsemble extends Struct.ComponentSchema {
  collectionName: 'components_project_ensembles';
  info: {
    description: 'O subsec\u021Biune a proiectului: titlu + descriere + (op\u021Bional) persoane, videouri \u0219i galerie foto. Ex: \u201ECorul bisericii\u201D, \u201EGalerie foto\u201D, \u201EFilm\u0103ri\u201D.';
    displayName: 'Sec\u021Biune';
    icon: 'layer';
  };
  attributes: {
    conductors: Schema.Attribute.Component<'project.person', true>;
    description: Schema.Attribute.Text;
    images: Schema.Attribute.Media<'images', true>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    peopleLabel: Schema.Attribute.String;
    videos: Schema.Attribute.Component<'project.video', true>;
  };
}

export interface ProjectPerson extends Struct.ComponentSchema {
  collectionName: 'components_project_people';
  info: {
    description: 'Un nume (ex. dirijor al corului). Se afi\u0219eaz\u0103 \u00EEn ordine aleatoare.';
    displayName: 'Persoan\u0103 (dirijor / membru)';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProjectVideo extends Struct.ComponentSchema {
  collectionName: 'components_project_videos';
  info: {
    description: 'Un video YouTube al forma\u021Biei. Se red\u0103 direct din pagin\u0103, \u00EEn ordine aleatoare. Titlul e op\u021Bional (doar pentru tine, \u00EEn admin).';
    displayName: 'Video (YouTube)';
    icon: 'play';
  };
  attributes: {
    title: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'home.value': HomeValue;
      'page.faq': PageFaq;
      'page.highlight': PageHighlight;
      'project.ensemble': ProjectEnsemble;
      'project.person': ProjectPerson;
      'project.video': ProjectVideo;
    }
  }
}
