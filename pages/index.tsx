// pages/index.tsx
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/venues",
      permanent: false, // switch to true when you're sure
    },
  };
}
export default function Index() {
  return null;
}
