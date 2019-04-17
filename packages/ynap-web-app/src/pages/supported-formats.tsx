import React, { Fragment } from 'react';
import styled from 'styled-components';

import '../styles/index.css';

import { parsers, countries } from 'ynap-parsers';
import countryNames from '../util/countries';
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
    <MetaTags
      title="Supported Formats"
      description={`YNAP supports ${parsers.length} different formats for banks of ${
        countries.length
      } countries, including ${parsers
        .slice(0, 4)
        .map(p => p.name)
        .join(', ')}, and more.`}
    />

    <Container>
      <h1>
        <a href="/">You Need A Parser</a>
      </h1>

      <h2>Supported Formats</h2>

      {['international', ...countries].map(c => (
        <Fragment key={c}>
          <h3>{countryNames[c] || c}</h3>
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
