import React, { useCallback, useEffect, useState } from 'react';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { Box, Button, EmptyStateLayout, Flex, Table, Tbody, Td, Th, Thead, Tr, Typography } from '@strapi/design-system';
import { Mail, Duplicate } from '@strapi/icons';

// Colegii invitați care încă n-au intrat. Strapi arată linkul de înregistrare o singură dată,
// imediat după invitare — dacă ai închis fereastra, nu mai ai de unde să-l iei, iar omul rămâne
// blocat fără ca cineva să observe. Aici sunt toate la un loc, cu retrimitere pe e-mail.
const InvitationsPage = () => {
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [invitations, setInvitations] = useState(null);
  const [sending, setSending] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await get('/api/invitations');
      setInvitations(data.data || []);
    } catch (err) {
      setInvitations([]);
      toggleNotification({ type: 'warning', message: 'Lista invitațiilor nu a putut fi citită.' });
    }
  }, [get, toggleNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const resend = async (inv) => {
    setSending(inv.id);
    try {
      const { data } = await post(`/api/invitations/${inv.id}/resend`, {});
      if (data && data.ok) {
        toggleNotification({ type: 'success', message: `Invitația a plecat din nou către ${data.to}.` });
      } else {
        toggleNotification({ type: 'warning', message: (data && data.error) || 'Trimiterea a eșuat.' });
      }
    } catch (err) {
      toggleNotification({ type: 'warning', message: 'Trimiterea a eșuat.' });
    } finally {
      setSending(null);
    }
  };

  const copy = async (inv) => {
    try {
      await navigator.clipboard.writeText(inv.link);
      toggleNotification({ type: 'success', message: 'Link copiat.' });
    } catch (err) {
      toggleNotification({ type: 'warning', message: 'Linkul nu a putut fi copiat.' });
    }
  };

  if (invitations === null) return <Page.Loading />;

  return (
    <Page.Main>
      <Layouts.Header
        title="Invitații în așteptare"
        subtitle="Colegi invitați care încă nu și-au făcut parola. Retrimite-le e-mailul sau dă-le linkul direct."
      />
      <Layouts.Content>
        {invitations.length === 0 ? (
          <EmptyStateLayout content="Nicio invitație în așteptare — toți colegii invitați au intrat deja." shadow="none" />
        ) : (
          <Box background="neutral0" hasRadius shadow="tableShadow">
            <Table colCount={4} rowCount={invitations.length}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">Persoana</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Rol</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Invitat la</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Acțiuni</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {invitations.map((inv) => (
                  <Tr key={inv.id}>
                    <Td>
                      <Flex direction="column" alignItems="start" gap={1}>
                        <Typography fontWeight="semiBold" textColor="neutral800">
                          {inv.name || inv.email}
                        </Typography>
                        {inv.name ? (
                          <Typography variant="pi" textColor="neutral600">
                            {inv.email}
                          </Typography>
                        ) : null}
                      </Flex>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{inv.roles || '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">
                        {new Date(inv.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Typography>
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Button size="S" variant="secondary" startIcon={<Mail />} loading={sending === inv.id} onClick={() => resend(inv)}>
                          Retrimite
                        </Button>
                        <Button size="S" variant="tertiary" startIcon={<Duplicate />} onClick={() => copy(inv)}>
                          Copiază linkul
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

export default InvitationsPage;
