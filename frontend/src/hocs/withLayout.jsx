import Layout from '../components/Layout';

const withLayout = (Component, title = '') => {
  return (props) => (
    <Layout title={title}>
      <Component {...props} />
    </Layout>
  );
};

export default withLayout;