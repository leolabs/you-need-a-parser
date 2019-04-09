import React from 'react';
import styled from 'styled-components';

import { parsers, countries } from '../parsers';
import MetaTags from '../components/meta-tags';

const Container = styled.div`
  padding: 4rem 2rem;
  max-width: 40rem;
`;

const SupportedFormats = () => (
  <>
    <MetaTags title="Supported Formats" />

    <Container>
      <h1>You Need A Parser</h1>
      <h2>Supported Formats</h2>

      {countries.map(c => (
        <>
          <h3>{c}</h3>
          <p>
            {parsers
              .filter(p => p.country === c)
              .map(p => (
                <>
                  <a href={p.link} target="_blank">
                    {p.name}
                  </a>
                  ,{' '}
                </>
              ))}
          </p>
        </>
      ))}
    </Container>
  </>
);

export default SupportedFormats;
