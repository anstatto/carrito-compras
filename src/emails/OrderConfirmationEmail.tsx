import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components'

interface OrderItem {
  producto: {
    nombre: string;
    precio: number;
  };
  cantidad: number;
}

interface Order {
  numero: string;
  items: OrderItem[];
  total: number;
}

interface User {
  name: string;
  email: string;
}

export default function OrderConfirmationEmail({ 
  order,
  user 
}: {
  order: Order;
  user: User;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{order.numero} ha sido confirmado</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '40px' }}>
          <Heading style={{ color: '#ec4899', textAlign: 'center', margin: '0 0 30px' }}>
            ¡Gracias por tu compra!
          </Heading>
          
          <Text style={{ fontSize: '16px', marginBottom: '20px' }}>
            Hola {user.name},
          </Text>
          
          <Text style={{ fontSize: '16px', marginBottom: '30px' }}>
            Tu pedido #{order.numero} ha sido confirmado y está siendo procesado.
          </Text>

          <Section style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <Heading as="h2" style={{ fontSize: '18px', marginBottom: '20px' }}>
              Resumen del pedido
            </Heading>

            {order.items.map((item, index) => (
              <Row key={index} style={{ marginBottom: '10px' }}>
                <Column>
                  <Text style={{ margin: '0' }}>
                    {item.cantidad}x {item.producto.nombre}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: '0' }}>
                    RD${(item.producto.precio * item.cantidad).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ margin: '20px 0' }} />

            <Row>
              <Column>
                <Text style={{ fontWeight: 'bold', margin: '0' }}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={{ fontWeight: 'bold', margin: '0' }}>
                  RD${order.total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ fontSize: '14px', color: '#666', marginTop: '30px', textAlign: 'center' }}>
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos respondiendo a este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  )
} 