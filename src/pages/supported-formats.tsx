import React, { Fragment } from 'react';
import styled from 'styled-components';

import '../styles/index.css';

import { parsers, countries } from '../parsers';
import MetaTags from '../components/meta-tags';

const Container = styled.div`
  padding: 4rem 2rem;
  max-width: 40rem;
  margin: auto;
`;

const ParserPill = styled.a`
  display: inline-block;
  padding: 0.1rem 0.8rem;
  border-radius: 100px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  text-decoration: none;
  background: #3ebd93;
  color: #fff !important;
`;

const SupportedFormats = () => (
  <>
    <MetaTags title="Supported Formats" />

    <Container>
      <h1>You Need A Parser</h1>
      <h2>Supported Formats</h2>

      {['international', ...countries].map(c => (
        <Fragment key={c}>
          <h3>{c}</h3>
          <p>
            {parsers
              .filter(p => p.country === c)
              .map(p => (
                <ParserPill key={p.link} href={p.link} target="_blank">
                  {p.name}
                </ParserPill>
              ))}
          </p>
        </Fragment>
      ))}
    </Container>
  </>
);

export default SupportedFormats;
