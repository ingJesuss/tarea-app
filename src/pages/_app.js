import "@/styles/globals.css"; //aqui en la app es el unico archivo donde se nos permite cargar un archivo css global

export default function MyApp({ Component, pageProps }) {
  return (
        <Component {...pageProps} />
  );
}
