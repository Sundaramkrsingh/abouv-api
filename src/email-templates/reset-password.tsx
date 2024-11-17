/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Img,
  Font,
} from '@react-email/components';

const ResetPassword = ({
  url,
  name,
  instaUrl,
  linkedinUrl,
}: {
  url: string;
  name: string;
  instaUrl: string;
  linkedinUrl: string;
}) => {
  const styles = {
    main: {
      backgroundColor: '#f0f0f0',
      fontFamily: '"Baloo 2", Arial, sans-serif', // Ensure fallback fonts are included
    },
    whiteBox: {
      width: '100%',
      padding: '102px 143px',
    },
    container: {
      backgroundColor: '#fff',
      minWidth: '640px',
    },
    sectionCenter: {
      width: '100%',
      textAlign: 'center' as const,
    },
    textLarge: {
      fontSize: '36px',
      fontWeight: 600,
      lineHeight: '64px',
      textAlign: 'center' as const,
      color: '#1B5360',
      marginBottom: '20px',
      fontFamily: '"Baloo 2", Arial, sans-serif',
    },
    textNormal: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '24px',
      textAlign: 'center' as const,
      color: '#7B7E82',
      marginBottom: '14px',
      fontFamily: '"Baloo 2", Arial, sans-serif',
    },
    codeText: {
      display: 'block',
      width: '35.625%',
      padding: '8px 10px 8px 10px',
      gap: '10px',
      borderRadius: '4px',
      backgroundColor: '#DFF6F2',
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '24px',
      textAlign: 'center' as const,
      color: '#1B5360',
      marginBottom: '27px',
      marginLeft: '105px',
      fontFamily: '"Baloo 2", Arial, sans-serif', // Ensure fallback fonts are included
    },
    link: {
      width: '90%',
      display: 'block',
      padding: '12px 20px 12px 20px',
      gap: '8px',
      borderRadius: '8px',
      border: '1px',
      backgroundColor: '#1B5360',
      color: '#fff',
      textDecoration: 'none' as const,
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '24px',
      fontFamily: '"Baloo 2", Arial, sans-serif', // Ensure fallback fonts are included
    },
    footer: {
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: '#014455',
      padding: '57.5px 245px 91.9px 245px',
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      color: '#F2F2F2',
      marginBottom: '26px',
      fontFamily: '"Baloo 2", Arial, sans-serif', // Ensure fallback fonts are included
    },
  };

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Baloo 2"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Verify your email</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.whiteBox}>
            <Section
              style={{
                ...styles.sectionCenter,
                paddingLeft: '100px',
                paddingBottom: '52px',
              }}
            >
              <Img
                width="123.55px"
                height="39.14px"
                src="https://dv.abouv.com/email-template/abouv-email.png"
                alt="abouv"
              />
            </Section>
            <Section style={styles.sectionCenter}>
              <Text style={styles.textLarge}>Hi {name},</Text>
              <Text style={styles.textNormal}>
                Forgot your password? Let’s set up a new one!,
              </Text>
              <a href={url} style={styles.link}>
                Reset Password
              </a>
            </Section>
            <Text style={styles.textNormal}>
              If you didn’t mean to reset your password, you can disregard this
              email and nothing will change.
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Img
              width="85.15px"
              height="87.6px"
              src="https://dv.abouv.com/email-template/abouv-logo-email.png"
              alt="abouv"
              style={{ marginBottom: '18px', marginLeft: '30px' }}
            />
            <Text style={styles.footerText}>Assess, Align, Achieve</Text>
            <Section style={{ display: 'flex', marginLeft: '30px' }}>
              <a href={instaUrl}>
                <Img
                  src="https://dv.abouv.com/email-template/instagram.png"
                  alt="instagram"
                  width="36px"
                  height="36px"
                  style={{ display: 'inline-flex' }}
                />
              </a>
              <a href={linkedinUrl}>
                <Img
                  src="https://dv.abouv.com/email-template/linkedin.png"
                  alt="Linkedin"
                  width="35.88px"
                  height="35.39px"
                  style={{ marginLeft: '12px', display: 'inline-flex' }}
                />
              </a>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPassword;
