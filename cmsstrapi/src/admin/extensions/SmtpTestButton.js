import React, { useState } from 'react';
import { useCMEditViewDataManager, useFetchClient, useNotification } from '@strapi/helper-plugin';
import { Button, Flex, Typography } from '@strapi/design-system';
import { Mail } from '@strapi/icons';

// Apare doar în ecranul de editare al setărilor „E-mail (SMTP)”.
const SmtpTestButton = () => {
  const { slug } = useCMEditViewDataManager();
  const { post } = useFetchClient();
  const toggleNotification = useNotification();
  const [loading, setLoading] = useState(false);

  if (slug !== 'api::smtp.smtp') return null;

  const onTest = async () => {
    setLoading(true);
    try {
      const { data } = await post('/api/smtp/test', {});
      if (data && data.ok) {
        toggleNotification({ type: 'success', message: `E-mail de test trimis către ${data.to}. Verifică inboxul.` });
      } else {
        toggleNotification({ type: 'warning', message: (data && data.error) || 'Testul a eșuat.' });
      }
    } catch (err) {
      toggleNotification({ type: 'warning', message: 'Salvează întâi setările (Save), apoi apasă Test.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={2}>
      <Button variant="secondary" startIcon={<Mail />} loading={loading} onClick={onTest} fullWidth>
        Trimite e-mail de test
      </Button>
      <Typography variant="pi" textColor="neutral600">
        Testează configurarea SALVATĂ, trimițând un e-mail către adresa destinatar.
      </Typography>
    </Flex>
  );
};

export default SmtpTestButton;
