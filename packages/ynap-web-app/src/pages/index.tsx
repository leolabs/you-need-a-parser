import React, { useEffect, useState } from 'react';
import { Link, graphql } from 'gatsby';
import { saveAs } from 'file-saver';
import styled, { keyframes, css } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../styles/index.css';
import { parseFile, parsers, countries } from 'ynap-parsers';
import MetaTags from '../components/meta-tags';
import { GitHubBadge } from '../components/github-badge';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(62, 189, 147, 0.2);
  }
  70% {
      box-shadow: 0 0 0 20px rgba(62, 189, 147, 0);
  }
  100% {
      box-shadow: 0 0 0 0 rgba(62, 189, 147, 0);
  }
`;

const Container = styled.div<{ uploadHover?: boolean }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;

  padding: 2rem;
  box-sizing: border-box;

  background: #f1f4f9;
  transition: background 0.2s;

  > p {
    max-width: 40rem;
    margin-bottom: 4rem;
  }

  ${p =>
    p.uploadHover &&
    css`
      background-color: hsl(218, 40, 90);

      .arrow-up {
        transform: translateY(-1px);
      }

      ${DropArea} {
        animation: ${pulse} 2s infinite;
        border-color: #3ebd93;
      }
    `}
`;

const DropArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  margin-bottom: 2.5rem;
  padding: 3rem 4rem;

  background: #fff;
  border: 3px #ccc solid;
  border-radius: 2rem;

  transition: border-color 0.2s;
`;

const UploadIcon = styled.svg`
  display: block;
  width: 6rem;
  overflow: visible;

  color: #666;

  .arrow-up {
    transition: transform 0.2s;
  }
`;

const Footer = styled.footer`
  p {
    margin: 0;

    &.small {
      margin-top: 0.2rem;
      font-size: 80%;
      opacity: 0.8;
    }
  }
`;

const App: React.FC<{ version: string; commit: string; timestamp: string }> = ({
  version,
  commit,
  timestamp,
}) => {
  const [uploadHover, setUploadHover] = useState(false);

  useEffect(() => {
    const enter = (e: DragEvent) => {
      setUploadHover(true);
      e.preventDefault();
      e.stopPropagation();
    };

    const leave = (e: DragEvent) => {
      setUploadHover(false);
      e.preventDefault();
      e.stopPropagation();
    };

    const drop = async (e: DragEvent) => {
      setUploadHover(false);
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer!.files);
      let errors: number = 0;

      for (const file of files) {
        try {
          const result = await parseFile(file);

          for (const parsedFile of result) {
            const blob = new Blob([parsedFile.data], {
              type: 'text/csv;charset=utf-8',
            });
            const fileName = [
              parsedFile.matchedParser.name,
              parsedFile.accountName,
              'ynap',
            ]
              .filter(e => e)
              .join('-');
            saveAs(blob, `${fileName}.csv`);
          }
        } catch (e) {
          errors++;
          toast(
            <>
              The file <strong>{file.name}</strong> errored: {e.message}
            </>,
            { type: 'error' },
          );
          throw e;
        }
      }

      if (files.length - errors > 0) {
        toast(
          <>
            Converted <strong>{files.length - errors}</strong> files.
          </>,
          { type: 'success' },
        );
      }
    };

    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', enter);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);

    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', enter);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
    };
  }, []);

  return (
    <>
      <GitHubBadge />
      <Container uploadHover={uploadHover}>
        <h1>You Need A Parser</h1>
        <p>
          YNAP converts CSV files from a variety of sources into a format that can
          easily be imported into{' '}
          <a href="https://youneedabudget.com" target="_blank" rel="noopener">
            You Need A Budget
          </a>
          . Just drag the files you want to convert into this window. Your files will
          never leave your browser.
        </p>
        <DropArea>
          <UploadIcon
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="arrow-up">
              <line x1="12" y1="3" x2="12" y2="15" />
              <polyline points="17 8 12 3 7 8" />
            </g>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </UploadIcon>
          <p>{uploadHover ? 'Drop' : 'Drag'} files here to parse</p>
        </DropArea>
        <p>
          YNAP supports {parsers.length} different formats for banks of{' '}
          {countries.length} countries, including{' '}
          {parsers
            .map(p => (
              <>
                <a key={p.link} href={p.link} target="_blank">
                  {p.name}
                </a>
                ,{' '}
              </>
            ))
            .slice(0, 10)}
          <Link to="/supported-formats">and more</Link>.
        </p>
        <Footer>
          <p>
            <a target="_blank" href="https://leolabs.org" rel="noopener">
              Made by Leo Bernard
            </a>{' '}
            |{' '}
            <a
              target="_blank"
              href="https://github.com/leolabs/you-need-a-parser/issues/new?template=format_request.md"
              rel="noopener"
            >
              Suggest a Format
            </a>{' '}
            |{' '}
            <a
              target="_blank"
              href="https://github.com/leolabs/you-need-a-parser"
              rel="noopener"
            >
              GitHub
            </a>
          </p>
          <p className="small">
            Version {version} | {' '}
            <a
              href={`https://github.com/leolabs/you-need-a-parser/commit/${commit}`}
              target="_blank"
            >
              Build {commit.substr(0, 7)} ({timestamp})
            </a>
          </p>
        </Footer>
      </Container>
    </>
  );
};

const Index = ({ data }) => (
  <>
    <MetaTags />
    <ToastContainer />
    <App
      version={data.site.siteMetadata.version}
      commit={data.site.siteMetadata.commit}
      timestamp={data.site.siteMetadata.timestamp}
    />
  </>
);

export const query = graphql`
  {
    site {
      siteMetadata {
        version
        commit
        timestamp
      }
    }
  }
`;

export default Index;
