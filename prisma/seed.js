const { passwordEncrypt } = require('../src/ingeitUtils/utils');
const { PrismaClient, PEDIDOESTADO } = require('@prisma/client');
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});
const { faker } = require('@faker-js/faker');
const cuid = require('cuid');

const USER_PROD = [
  {
    name: 'Sebastian Maturana',
    username: 'smaturana',
    password: passwordEncrypt('smaturana'),
    role: 'SUPERUSER',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }],
      },
    },
  },
  {
    name: 'Verónica Juarez',
    username: 'vjuarez',
    password: passwordEncrypt('vjuarez'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Miguel Acuña',
    username: 'macuña',
    password: passwordEncrypt('macuña'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Ines Aguilera',
    username: 'iaguilera',
    password: passwordEncrypt('iaguilera'),
    role: 'COMERCIALIZADORA',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Maria Ines Alvarez',
    username: 'ialvarez',
    password: passwordEncrypt('ialvarez'),
    comercializadoraId: 4,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Mercedes Natalia Roldan',
    username: 'nroldan',
    password: passwordEncrypt('nroldan'),
    comercializadoraId: 4,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Fernando Bulacio',
    username: 'fbulacio',
    password: passwordEncrypt('fbulacio'),
    comercializadoraId: 4,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Ivanna Millares',
    username: 'imillares',
    password: passwordEncrypt('imillares'),
    comercializadoraId: 4,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Karina Perez',
    username: 'kperez',
    password: passwordEncrypt('kperez'),
    comercializadoraId: 4,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Carolina Funes',
    username: 'cfunes',
    password: passwordEncrypt('cfunes'),
    role: 'COMERCIALIZADORA',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Celeste Gomez',
    username: 'cgomez',
    password: passwordEncrypt('cgomez'),
    comercializadoraId: 10,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Luciana Suarez',
    username: 'lsuarez',
    password: passwordEncrypt('lsuarez'),
    comercializadoraId: 10,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Brenda Gomez',
    username: 'bgomez',
    password: passwordEncrypt('bgomez'),
    comercializadoraId: 10,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Anabella Alives',
    username: 'aalives',
    password: passwordEncrypt('aalives'),
    comercializadoraId: 10,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Gabriel Suarez',
    username: 'gsuarez',
    password: passwordEncrypt('gsuarez'),
    comercializadoraId: 10,
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Alejandro Calazanz',
    username: 'acalazanz',
    password: passwordEncrypt('acalazanz'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Maria Jose Lazarte',
    username: 'mlazarte',
    password: passwordEncrypt('mlazarte'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Raúl Amaya',
    username: 'ramaya',
    password: passwordEncrypt('ramaya'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Exequiel Pedroza',
    username: 'epedroza',
    password: passwordEncrypt('epedroza'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Sandra Osores',
    username: 'sosores',
    password: passwordEncrypt('sosores'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Eugenia Tula',
    username: 'etula',
    password: passwordEncrypt('etula'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Usuario de prueba',
    username: 'prueba',
    password: passwordEncrypt('prueba'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    name: 'Sebastian Gonzalez',
    username: 'sgonzalez',
    password: passwordEncrypt('sgonzalez'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
];

const USER_DEV = [
  {
    id: 1,
    name: 'Sebastian Maturana',
    username: 'smaturana',
    password: passwordEncrypt('smaturana'),
    role: 'SUPERUSER',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }],
      },
    },
  },
  {
    id: 2,
    name: 'Ricky Bruno',
    username: 'rbruno',
    password: passwordEncrypt('rbruno'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }],
      },
    },
  },
  {
    id: 3,
    name: 'Kevin Gomez',
    username: 'kgomez',
    password: passwordEncrypt('kgomez'),
    role: 'AUTORIZADOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }],
      },
    },
  },
  {
    id: 4,
    name: 'Comercializadora 1',
    username: 'comercializadora1',
    password: passwordEncrypt('comercializadora1'),
    role: 'COMERCIALIZADORA',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 5,
    name: 'Comercializadora 2',
    username: 'comercializadora2',
    password: passwordEncrypt('comercializadora2'),
    role: 'COMERCIALIZADORA',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 6,
    name: 'Vendedor 1 C1',
    username: 'vendedor1c1',
    password: passwordEncrypt('vendedor1c1'),
    role: 'VENDEDOR',
    comercializadoraId: 4,
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 7,
    name: 'Vendedor 2 C1',
    username: 'vendedor2c1',
    password: passwordEncrypt('vendedor2c1'),
    role: 'VENDEDOR',
    comercializadoraId: 4,
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 8,
    name: 'Vendedor 1 C2',
    username: 'vendedor1c2',
    password: passwordEncrypt('vendedor1c2'),
    role: 'VENDEDOR',
    comercializadoraId: 5,
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 9,
    name: 'Vendedor independiente',
    username: 'vendedorindependiente',
    password: passwordEncrypt('vendedorindependiente'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
  {
    id: 10,
    name: 'The beast',
    username: 'vendedor',
    password: passwordEncrypt('vendedor'),
    role: 'VENDEDOR',
    allowedApps: {
      createMany: {
        data: [{ availableAppNombre: 'APP_ADMIN' }, { availableAppNombre: 'APP_MOVIL' }],
      },
    },
  },
];

async function main() {
  await prisma.entidad.createMany({
    data: [
      { tipo: 'BANCO', nombre: 'Abn-amro Bank' },
      { tipo: 'BANCO', nombre: 'Almafuerte Coop. Ltd' },
      { tipo: 'BANCO', nombre: 'American Express S.A.' },
      { tipo: 'BANCO', nombre: 'Europeo (beal)' },
      { tipo: 'BANCO', nombre: 'Baires S.A.' },
      { tipo: 'BANCO', nombre: 'Central de la Republica' },
      { tipo: 'BANCO', nombre: 'Chemical Bank' },
      { tipo: 'BANCO', nombre: 'Citibank N.A.' },
      { tipo: 'BANCO', nombre: 'Comafi S.A.' },
      { tipo: 'BANCO', nombre: 'Comercial del Tandil.' },
      { tipo: 'BANCO', nombre: 'Credicoop Coop. Ltdo' },
      { tipo: 'BANCO', nombre: 'Credito de Cuyo S.A.' },
      { tipo: 'BANCO', nombre: 'de Balcarce Coop. Lt' },
      { tipo: 'BANCO', nombre: 'de Corrientes S.A.' },
      { tipo: 'BANCO', nombre: 'de Entre Rios S.A.' },
      { tipo: 'BANCO', nombre: 'Galicia' },
      { tipo: 'BANCO', nombre: 'Nacion Argentina' },
      { tipo: 'BANCO', nombre: 'de la Pampa' },
      { tipo: 'BANCO', nombre: 'de la pcia de Buenos Aires' },
      { tipo: 'BANCO', nombre: 'de la pcia de Chubut' },
      { tipo: 'BANCO', nombre: 'de la pcia de Cordoba' },
      { tipo: 'BANCO', nombre: 'de Formosa S.A.' },
      { tipo: 'BANCO', nombre: 'de la pcia de Jujuy' },
      { tipo: 'BANCO', nombre: 'de la pcia de San Luis' },
      { tipo: 'BANCO', nombre: 'de la pcia de Sgo. del Estero' },
      { tipo: 'BANCO', nombre: 'Banco del Tucuman' },
      { tipo: 'BANCO', nombre: 'de la pcia del Neuquen' },
      { tipo: 'BANCO', nombre: 'de la Rep. Oriental del Uruguay' },
      { tipo: 'BANCO', nombre: 'de Mendoza S.A.' },
      { tipo: 'BANCO', nombre: 'de Olavarria S.A.' },
      { tipo: 'BANCO', nombre: 'de Prevision Social' },
      { tipo: 'BANCO', nombre: 'de Rio Tercero Coop.' },
      { tipo: 'BANCO', nombre: 'de San Juan S.A.' },
      { tipo: 'BANCO', nombre: 'de Santa Fe S.A.' },
      { tipo: 'BANCO', nombre: 'de Valores S.A.' },
      { tipo: 'BANCO', nombre: 'del Buen Ayres S.A.' },
      { tipo: 'BANCO', nombre: 'del Fuerte S.A.' },
      { tipo: 'BANCO', nombre: 'del Sol S.A.' },
      { tipo: 'BANCO', nombre: 'Bansud S.A.' },
      { tipo: 'BANCO', nombre: 'del Suquia S.A.' },
      { tipo: 'BANCO', nombre: 'Deutsche Bank S.A.' },
      { tipo: 'BANCO', nombre: 'do Brasil S.A.' },
      { tipo: 'BANCO', nombre: 'do Estado de Sao Paulo' },
      { tipo: 'BANCO', nombre: 'Empresario de Tucuman' },
      { tipo: 'BANCO', nombre: 'Banex S.A.' },
      { tipo: 'BANCO', nombre: 'Exterior S.A.' },
      { tipo: 'BANCO', nombre: 'Federal Argentino S.' },
      { tipo: 'BANCO', nombre: 'Finansur S.A.' },
      { tipo: 'BANCO', nombre: 'Florencia S.A.' },
      { tipo: 'BANCO', nombre: 'General de Negocios' },
      { tipo: 'BANCO', nombre: 'Hipotecario Nacional' },
      { tipo: 'BANCO', nombre: 'Internationale Neder' },
      { tipo: 'BANCO', nombre: 'Interfinanzas S.A.' },
      { tipo: 'BANCO', nombre: 'Israelita de Cordoba' },
      { tipo: 'BANCO', nombre: 'Itau Argentina S.A.' },
      { tipo: 'BANCO', nombre: 'Julio S.A.' },
      { tipo: 'BANCO', nombre: 'Liniers Sudamericano' },
      { tipo: 'BANCO', nombre: 'Lloyds Bank (bisa) L' },
      { tipo: 'BANCO', nombre: 'Los Tilos S.A.' },
      { tipo: 'BANCO', nombre: 'Macro S.A.' },
      { tipo: 'BANCO', nombre: 'Mariva S.A.' },
      { tipo: 'BANCO', nombre: 'Mayo Coop. Ltdo.' },
      { tipo: 'BANCO', nombre: 'Mayorista del Plata' },
      { tipo: 'BANCO', nombre: 'U.n.b. S.A.' },
      { tipo: 'BANCO', nombre: 'Mercurio S.A.' },
      { tipo: 'BANCO', nombre: 'Mildesa S.A.' },
      { tipo: 'BANCO', nombre: 'Municipal de la Plata' },
      { tipo: 'BANCO', nombre: 'Municipal de Parana' },
      { tipo: 'BANCO', nombre: 'Municipal de Rosario' },
      { tipo: 'BANCO', nombre: 'Municipal de Tucuman' },
      { tipo: 'BANCO', nombre: 'Nuevo Banco de la Rioja' },
      { tipo: 'BANCO', nombre: 'Nuevo Banco del Chaco' },
      { tipo: 'BANCO', nombre: 'Piano S.A.' },
      { tipo: 'BANCO', nombre: 'Platense S.A.' },
      { tipo: 'BANCO', nombre: 'Privado de Inversion' },
      { tipo: 'BANCO', nombre: 'Provincia de Tierra' },
      { tipo: 'BANCO', nombre: 'Provincial de Salta' },
      { tipo: 'BANCO', nombre: 'Quilmes S.A.' },
      { tipo: 'BANCO', nombre: 'Real S.A.' },
      { tipo: 'BANCO', nombre: 'Regional de Cuyo S.A.' },
      { tipo: 'BANCO', nombre: 'Republica S.A.' },
      { tipo: 'BANCO', nombre: 'HSBC Bank Argentina' },
      { tipo: 'BANCO', nombre: 'Roela S.A.' },
      { tipo: 'BANCO', nombre: 'Saenz S.A.' },
      { tipo: 'BANCO', nombre: 'Santafesino de Inv.' },
      { tipo: 'BANCO', nombre: 'Shaw S.A.' },
      { tipo: 'BANCO', nombre: 'Social de Cordoba' },
      { tipo: 'BANCO', nombre: 'Sudameris' },
      { tipo: 'BANCO', nombre: 'Supervielle Societe' },
      { tipo: 'BANCO', nombre: 'The Bank of New York' },
      { tipo: 'BANCO', nombre: 'The Chase Manhattan' },
      { tipo: 'BANCO', nombre: 'Bankboston S.A.' },
      { tipo: 'BANCO', nombre: 'Transandino S.A.' },
      { tipo: 'BANCO', nombre: 'Velox S.A.' },
      { tipo: 'BANCO', nombre: 'Medefin S.A.' },
      { tipo: 'BANCO', nombre: 'Finvercon S.A. Cia.' },
      { tipo: 'BANCO', nombre: 'V.w. Cia. Financiera' },
      { tipo: 'BANCO', nombre: 'Masventas S.A. Cia.' },
      { tipo: 'BANCO', nombre: 'Financ. del Tuyu Cia' },
      { tipo: 'BANCO', nombre: 'Pavon Coop. Ltda.' },
      { tipo: 'BANCO', nombre: 'Varela Coop. Ltda.' },
      { tipo: 'BANCO', nombre: 'La Capital Coop. Ltd' },
      { tipo: 'BANCO', nombre: 'Bet-am Nueve de Julio' },
      { tipo: 'BANCO', nombre: 'American Express Arg' },
      { tipo: 'BANCO', nombre: 'Red Conmutada S.A.' },
      { tipo: 'BANCO', nombre: 'Silefed S.A.' },
      { tipo: 'BANCO', nombre: 'Tarshop S.A.' },
      { tipo: 'BANCO', nombre: "Women's Cards S.A." },
      { tipo: 'BANCO', nombre: 'Dinners' },
      { tipo: 'BANCO', nombre: 'Novel-card S.A.' },
      { tipo: 'BANCO', nombre: 'Forma Credito S.A.' },
      { tipo: 'BANCO', nombre: 'Credibilidad S.A.' },
      { tipo: 'BANCO', nombre: 'Scioli Billet S.A.' },
      { tipo: 'BANCO', nombre: 'Sist. Unif. de Cdto.' },
      { tipo: 'BANCO', nombre: 'Redy Card S.A.' },
      { tipo: 'BANCO', nombre: 'Temugin S.A.' },
      { tipo: 'BANCO', nombre: 'Cardholder S.A.' },
      { tipo: 'BANCO', nombre: 'Colmi S.A.' },
      { tipo: 'BANCO', nombre: 'Acceder S.A.' },
      { tipo: 'BANCO', nombre: 'Azul Tarjetas S.r.l.' },
      { tipo: 'BANCO', nombre: 'Clinica Mariano Moreno' },
      { tipo: 'BANCO', nombre: 'C.v.c. Sociedad de S' },
      { tipo: 'BANCO', nombre: 'Katefa S.A.' },
      { tipo: 'BANCO', nombre: 'Sempre S.A.' },
      { tipo: 'BANCO', nombre: 'Italcred S.R.L.' },
      { tipo: 'BANCO', nombre: 'Credigall S.A.' },
      { tipo: 'BANCO', nombre: 'Credi-paz S.A.' },
      { tipo: 'BANCO', nombre: 'Creditobe S.A.' },
      { tipo: 'BANCO', nombre: 'Reding S.A.' },
      { tipo: 'BANCO', nombre: 'Hurling Cred S.A.' },
      { tipo: 'BANCO', nombre: 'Cartasur Card S.A.' },
      { tipo: 'BANCO', nombre: 'Credinuevo S.A.' },
      { tipo: 'BANCO', nombre: 'Credizar S.A.' },
      { tipo: 'BANCO', nombre: 'Consumor S.A.' },
      { tipo: 'BANCO', nombre: 'Eps S.A.' },
      { tipo: 'BANCO', nombre: 'Linbel S.A.' },
      { tipo: 'BANCO', nombre: 'A.b.c. S.R.L.' },
      { tipo: 'BANCO', nombre: 'Hugo Ricardo Lardone' },
      { tipo: 'BANCO', nombre: 'Kadimacor S.A.' },
      { tipo: 'BANCO', nombre: 'Mattia Ruben Gustavo' },
      { tipo: 'BANCO', nombre: 'Nifaco S.R.L.' },
      { tipo: 'BANCO', nombre: 'Sergio Alberto Tanch' },
      { tipo: 'BANCO', nombre: 'Talor S.R.L.' },
      { tipo: 'BANCO', nombre: 'Tarjeta Naranja S.A.' },
      { tipo: 'BANCO', nombre: 'Pase Libre S.R.L.' },
      { tipo: 'BANCO', nombre: 'Ultra S.R.L.' },
      { tipo: 'BANCO', nombre: 'Lograr S.R.L.' },
      { tipo: 'BANCO', nombre: 'S.A. Club del Este' },
      { tipo: 'BANCO', nombre: 'Tarjetas Cuyanas S.A.' },
      { tipo: 'BANCO', nombre: "L'target S.A." },
      { tipo: 'BANCO', nombre: 'Proveco S.A.' },
      { tipo: 'BANCO', nombre: 'Carta Andina S.R.L.' },
      { tipo: 'BANCO', nombre: 'Tarjeta Comfiar S.A.' },
      { tipo: 'BANCO', nombre: 'Crediventas S.A.' },
      { tipo: 'BANCO', nombre: 'Crediline S.R.L.' },
      { tipo: 'BANCO', nombre: 'Pluscard Tucuman S.A.' },
      { tipo: 'BANCO', nombre: 'Corpbanca' },
      { tipo: 'BANCO', nombre: 'de Mendoza S.A.' },
      { tipo: 'BANCO', nombre: 'Banco de Jujuy S.A.' },
      { tipo: 'BANCO', nombre: 'Mercobank S.A.' },
      { tipo: 'BANCO', nombre: 'Kookmin Bank S.A.' },
      { tipo: 'BANCO', nombre: 'de San Miguel de Tucuman' },
      { tipo: 'BANCO', nombre: 'Credicoop Coop. Ltdo' },
      { tipo: 'BANCO', nombre: 'BANCO DE SERVICIOS FINANCIEROS §.A.' },
      { tipo: 'BANCO', nombre: 'Banco de Terceros' },
      { tipo: 'BANCO', nombre: 'Bank of America' },
      { tipo: 'BANCO', nombre: 'Nuevo Banco Bisel S.A.' },
      { tipo: 'BANCO', nombre: 'Visa' },
      { tipo: 'BANCO', nombre: 'Mastercard' },
      { tipo: 'BANCO', nombre: 'Documentos de terceros' },
      { tipo: 'BANCO', nombre: 'American Express' },
      { tipo: 'BANCO', nombre: 'PRUEBA' },
      { tipo: 'BANCO', nombre: 'Banco Columbia S.A.' },
      { tipo: 'BANCO', nombre: 'Banco Patagonia' },
      { tipo: 'BANCO', nombre: 'Santander Rio S.A' },
      { tipo: 'BANCO', nombre: 'Banco Santa Cruz' },
      { tipo: 'BANCO', nombre: 'Banco Frances' },
      { tipo: 'BANCO', nombre: 'Banco Ciudad' },
      { tipo: 'BANCO', nombre: 'Banco Entre Rios' },
      {
        tipo: 'INSTITUCION',
        nombre: 'SINDICATO DE OBREROS Y EMPLEADOS DE LA MINUCIPALIDAD DE YERBA BUENA',
      },
      { tipo: 'INSTITUCION', nombre: 'LAS TALITAS' },
      { tipo: 'INSTITUCION', nombre: 'LAS TALITAS H.C.D.' },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD DE LIBERTADOR' },
      { tipo: 'INSTITUCION', nombre: 'VILLA LA PUNTA' },
      { tipo: 'INSTITUCION', nombre: 'TAPSO' },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD ROSARIO DE LA FRONTERA' },
      { tipo: 'INSTITUCION', nombre: 'ATILRA' },
      { tipo: 'INSTITUCION', nombre: 'DELEGACION COMUNA DE LAPRIDA' },
      {
        tipo: 'INSTITUCION',
        nombre: 'SINDICATO DE TRABAJADORES MUNICIPALES DE LA CIUDAD DE CONCEPCIÓN',
      },
      { tipo: 'INSTITUCION', nombre: 'CASINO PROVINCIAL TUCUMÁN' },
      { tipo: 'INSTITUCION', nombre: 'SOEMJ - CALILEGUA' },
      { tipo: 'INSTITUCION', nombre: 'SOEMJ - YUTO' },
      { tipo: 'INSTITUCION', nombre: 'SOEMS' },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD DE SAN MIGUEL DE TUCUMÁN' },
      { tipo: 'INSTITUCION', nombre: 'HONORABLE CONCEJO DELIBERANTE SMT' },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD EL TALAR' },
      { tipo: 'INSTITUCION', nombre: 'CEC LIBERTADOR SAN MARTIN' },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD DE PALPALA' },
      {
        tipo: 'INSTITUCION',
        nombre: 'SINDICATO DE OBREROS Y EMPLEADOS TELEFÓNICOS DE TUCUMÁN',
      },
      { tipo: 'INSTITUCION', nombre: 'SINDICATO UNIÓN OBREROS CERVECEROS' },
      { tipo: 'INSTITUCION', nombre: 'PROV. DE SANTIAGO - PLANTA PERMANENTE' },
      { tipo: 'INSTITUCION', nombre: 'PROV. DE SANTIAGO - CONTRATADO' },
      { tipo: 'INSTITUCION', nombre: 'PROV. DE SANTIAGO - DOCENTE' },
      { tipo: 'INSTITUCION', nombre: 'PROV. DE SANTIAGO - POLICIA' },
      { tipo: 'INSTITUCION', nombre: 'ATRAC' },
      {
        tipo: 'INSTITUCION',
        nombre: 'ASOCIACION CIVIL DEL PERSONAL POLICIAL DE JUJUY',
      },
      { tipo: 'INSTITUCION', nombre: 'INSTITUCIÓN BANCO MACRO' },
      { tipo: 'INSTITUCION', nombre: 'SAMPCE' },
      { tipo: 'BANCO', nombre: 'UPCN' },
      { tipo: 'INSTITUCION', nombre: 'APUTN' },
      { tipo: 'INSTITUCION', nombre: 'CASA DE GOBIERNO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA 7 DE ABRIL' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA AGUA DULCE' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA ALTO VERDE' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA ARCAIDA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA CEVIL REDONDO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA CHOROMORO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA COLOMBRES' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA DELFIN GALLO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA EL BRACHO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA EL CHAÑAR' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA EL MANANTIAL' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA EL NARANJITO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA ESQUINA Y MANCOPA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA ESTACION ARAOZ Y TACANA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA GASTONA Y BELICHA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA GOBERNADOR GARMENDIA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LA ESPERANZA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LA FLORIDA Y LUISIANA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LAS TALAS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LOS BULACIOS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LOS NOGALES' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LOS PEREZ' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LOS RALOS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA LOS SOSA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA MANUELA PEDRAZA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA QUILMES Y LOS SUELDOS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA RANCHILLOS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA RIO CHICO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA RIO COLORADO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA RIO SECO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SAN PABLO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SAN PEDRO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SANTA ANA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SANTA CRUZ Y LA TUNA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SANTA LUCIA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA SANTA ROSA' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA VILLA BELGRANO' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA VILLA PADRE MONTI' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA VILLA QUINTEROS' },
      { tipo: 'INSTITUCION', nombre: 'CONSTRUCCIONES ESCOLARES' },
      { tipo: 'INSTITUCION', nombre: 'COOPERATIVA 1° DE MAYO' },
      { tipo: 'INSTITUCION', nombre: 'CRCM JULIO ROCA' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION DE ARQUITECTURA Y URBANISMO' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION DE COMERCIO INTERIOR' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION DE RECURSOS HIDRICOS' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION DE REGISTRO INMOBILIARIO' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION DE TRANSPORTE' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION GENERAL DE RECURSOS HUMANOS' },
      { tipo: 'INSTITUCION', nombre: 'Direccion Provincial de Aeronautica' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION PROVINCIAL DE DEFENSA CIVIL' },
      { tipo: 'INSTITUCION', nombre: 'DIRECCION PROVINCIAL DEL AGUA' },
      { tipo: 'INSTITUCION', nombre: 'ENTE AUTARQUICO TEATRO MERCEDES SOSA' },
      { tipo: 'INSTITUCION', nombre: 'ENTE AUTARQUICO TUCUMAN TURISMO' },
      { tipo: 'INSTITUCION', nombre: 'ENTE CULTURAL' },
      { tipo: 'INSTITUCION', nombre: 'ENTE DE INFRAESTRUCTURA COMUNITARIA' },
      { tipo: 'INSTITUCION', nombre: 'ESCUELAS PROVINCIALES' },
      { tipo: 'INSTITUCION', nombre: 'ESCUELAS SECUNDARIAS TRANSFERIDAS' },
      { tipo: 'INSTITUCION', nombre: 'FISCALIA DE ESTADO' },
      { tipo: 'INSTITUCION', nombre: 'INSTITUTO GERONTOLOGICO' },
      { tipo: 'INSTITUCION', nombre: 'INSTITUTO PUERICULTURA' },
      { tipo: 'INSTITUCION', nombre: 'INSTITUTOS PENALES' },
      { tipo: 'INSTITUCION', nombre: 'MINISTERIO DE DESARROLLO SOCIAL' },
      { tipo: 'INSTITUCION', nombre: 'MINISTERIO DE ECONOMIA' },
      {
        tipo: 'INSTITUCION',
        nombre: 'MINISTERIO DE GOBIERNO EDUCACION Y JUSTICIA',
      },
      { tipo: 'INSTITUCION', nombre: 'MUNICIPALIDAD DE SAN MIGUEL DE TUCUMAN' },
      { tipo: 'INSTITUCION', nombre: 'MUTUAL POLICIAL' },
      { tipo: 'INSTITUCION', nombre: 'PATRONATO DE INTERNOS Y LIBERADOS' },
      { tipo: 'INSTITUCION', nombre: 'RED PRESIDENCIA DE LA NACION' },
      { tipo: 'INSTITUCION', nombre: 'REGISTRO CIVIL' },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE ARTICULACION TERRITORIAL Y DESARROLLO LOCAL',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE COMUNICACION PUBLICA',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE COORDINACION CON MUNICIPIOS Y COMUNAS RURALES',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE GESTION PUBLICA Y PLANEAMIENTO',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE PREVENCION Y ASISTENCIA DE LAS ADICCIONES',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SECRETARIA DE ESTADO DE SANEAMIENTO Y MEJORAMIENTO DE ESPACIOS PUBLICOS',
      },
      { tipo: 'INSTITUCION', nombre: 'SECRETARIA DE TRABAJO' },
      { tipo: 'INSTITUCION', nombre: 'SECRETARIA GENERAL DE LA GOBERNACION' },
      { tipo: 'INSTITUCION', nombre: 'SEPAPYS' },
      { tipo: 'INSTITUCION', nombre: 'SI.PRO.SA' },
      {
        tipo: 'INSTITUCION',
        nombre: 'SIND. EMPLEADOS DEL CORREO Y TELECOMUNICACIONES',
      },
      {
        tipo: 'INSTITUCION',
        nombre: 'SUBSECRETARIA DE ASUNTOS AGRARIOS Y ALIMENTICIOS',
      },
      { tipo: 'INSTITUCION', nombre: 'SUBSECRETARIA DE DEPORTES' },
      { tipo: 'INSTITUCION', nombre: 'TALLERES PROTEGIDOS' },
      { tipo: 'INSTITUCION', nombre: 'COMUNA DE ACHERAL' },
      { tipo: 'INSTITUCION', nombre: 'Fundación Miguel Lillo' },
      { tipo: 'INSTITUCION', nombre: 'Universidad Tecnológica Tucumán' },
      { tipo: 'INSTITUCION', nombre: 'Colegio Médico' },
      { tipo: 'INSTITUCION', nombre: 'Cooperativa 1ro de Mayo' },
      { tipo: 'INSTITUCION', nombre: 'Simoca' },
      { tipo: 'INSTITUCION', nombre: 'AGEJ' },
    ],
  });
  await prisma.tipoConsulta.createMany({
    data: [{ nombre: 'PRESTAMO' }, { nombre: 'ELECTRODOMESTICO' }],
  });
  await prisma.setting.createMany({
    data: [
      {
        id: 1,
        name: 'DIAS ESPERA NUEVO PEDIDO',
        description:
          'Con este valor, usted podrá configurar cuandos días de espera necesitará un vendedor para realizar un nuevo pedido a un cliente que ya tiene un pedido realizado.',
        value: '15',
      },
      {
        id: 2,
        name: 'DIAS ESPERA ELIMINAR ARCHIVOS ADJUNTOS',
        description:
          'Con este valor, el sistema borrará de manera automática todos los archivos adjuntos que un vendedor subió al realizar un nuevo pedido, luego de que el pedido cumplió los días configurados en esta opción.',
        value: '30',
      },
      {
        id: 3,
        name: 'MAXIMO TAMAÑO ARCHIVOS ADJUNTOS (MB)',
        description:
          'Con este valor, usted podrá indicar el tamaño máximo (en megabytes) de los archivos que el vendedor adjunte a los pedidos. Referencia: un PDF que contenga 2 fotos puede pesar aproximadamente 10 MB.',
        value: '20',
      },
    ],
  });
  await prisma.availableApp.createMany({
    data: [{ nombre: 'APP_MOVIL' }, { nombre: 'APP_ADMIN' }],
  });
  if (process.env.ENV === 'PROD') {
    await prisma.user.create({
      data: USER_PROD[0],
    });
    await prisma.user.create({
      data: USER_PROD[1],
    });
    await prisma.user.create({
      data: USER_PROD[2],
    });
    await prisma.user.create({
      data: USER_PROD[3],
    });
    await prisma.user.create({
      data: USER_PROD[4],
    });
    await prisma.user.create({
      data: USER_PROD[5],
    });
    await prisma.user.create({
      data: USER_PROD[6],
    });
    await prisma.user.create({
      data: USER_PROD[7],
    });
    await prisma.user.create({
      data: USER_PROD[8],
    });
    await prisma.user.create({
      data: USER_PROD[9],
    });
    await prisma.user.create({
      data: USER_PROD[10],
    });
    await prisma.user.create({
      data: USER_PROD[11],
    });
    await prisma.user.create({
      data: USER_PROD[12],
    });
    await prisma.user.create({
      data: USER_PROD[13],
    });
    await prisma.user.create({
      data: USER_PROD[14],
    });
    await prisma.user.create({
      data: USER_PROD[15],
    });
    await prisma.user.create({
      data: USER_PROD[16],
    });
    await prisma.user.create({
      data: USER_PROD[17],
    });
    await prisma.user.create({
      data: USER_PROD[18],
    });
    await prisma.user.create({
      data: USER_PROD[19],
    });
    await prisma.user.create({
      data: USER_PROD[20],
    });
    await prisma.user.create({
      data: USER_PROD[21],
    });
    await prisma.user.create({
      data: USER_PROD[22],
    });
  }

  if (process.env.ENV !== 'PROD') {
    await prisma.user.create({
      data: USER_DEV[0],
    });
    await prisma.user.create({
      data: USER_DEV[1],
    });
    await prisma.user.create({
      data: USER_DEV[2],
    });
    await prisma.user.create({
      data: USER_DEV[3],
    });
    await prisma.user.create({
      data: USER_DEV[4],
    });
    await prisma.user.create({
      data: USER_DEV[5],
    });
    await prisma.user.create({
      data: USER_DEV[6],
    });
    await prisma.user.create({
      data: USER_DEV[7],
    });
    await prisma.user.create({
      data: USER_DEV[8],
    });
    await prisma.user.create({
      data: USER_DEV[9],
    });

    const clientes = Array.from(Array(100)).map(() => {
      const sexo = faker.random.arrayElement(['MASCULINO', 'FEMENINO', 'NO BINARIO']);
      let gender = 'male';
      if (sexo === 'FEMENINO') gender = 'female';
      const firstName = faker.name.firstName(gender);
      const middleName = faker.name.firstName(gender);
      let name = firstName;
      if (faker.datatype.boolean()) name += ` ${middleName}`;
      return {
        nombre: name,
        apellido: faker.name.lastName(),
        dni: faker.helpers.regexpStyleStringParse('[10000000-50000000]'),
        sexo: faker.random.arrayElement(['MASCULINO', 'FEMENINO', 'NO_BINARIO']),
      };
    });
    await prisma.cliente.createMany({
      data: clientes,
    });
    const pedidos = Array.from(Array(300).keys()).map((element) => {
      const date = new Date(faker.date.between('2020-01-01T00:00:00.000Z', '2022-03-01T00:00:00.000Z').toISOString().split('.')[0] + '+0000');
      return {
        id: element + 1,
        numeroPedido: cuid().slice(19, 25).toUpperCase(),
        clienteId: faker.datatype.number({ min: 1, max: 100 }),
        entidadId: faker.datatype.number({ min: 1, max: 301 }),
        creadoPorId: faker.datatype.number({ min: 4, max: 9 }),
        tipoConsultaId: faker.datatype.number({ min: 1, max: 2 }),
        montoSolicitado: faker.datatype.float({ min: 10000, max: 90000 }),
        comentarioVendedor: faker.datatype.number({ min: 1, max: 10 }) % 2 === 0 ? faker.lorem.sentence() : null,
        createdAt: date,
        updatedAt: date,
      };
    });
    await prisma.pedido.createMany({
      data: pedidos,
    });
    const pedidoEstados = pedidos.map((pedido, index) => {
      const estado = faker.random.arrayElement([
        PEDIDOESTADO.PENDIENTE,
        PEDIDOESTADO.PENDIENTE_DE_MARGEN,
        PEDIDOESTADO.PENDIENTE_DE_MARGEN_OK,
        PEDIDOESTADO.APROBADO,
        PEDIDOESTADO.RECHAZADO,
      ]);
      const cantidadCuotas = faker.random.arrayElement([1, 3, 6, 9, 12, 18, 24, 32]);
      return {
        estado,
        enRevision: [PEDIDOESTADO.PENDIENTE, PEDIDOESTADO.PENDIENTE_DE_MARGEN, PEDIDOESTADO.PENDIENTE_DE_MARGEN_OK].includes(estado)
          ? faker.random.arrayElement([true, false])
          : false,
        montoAutorizado: estado === 'APROBADO' ? pedido.montoSolicitado : null,
        cantidadCuotas: estado === 'APROBADO' ? cantidadCuotas : null,
        montoCuota: estado === 'APROBADO' ? pedido.montoSolicitado / cantidadCuotas : null,
        comentario:
          estado === 'PENDIENTE' || estado === 'EN_REVISION' ? null : faker.datatype.number({ min: 1, max: 10 }) % 2 === 0 ? faker.lorem.sentence() : null,
        fecha: estado === 'PENDIENTE' || estado === 'EN_REVISION' ? null : pedido.createdAt,
        pedidoId: index + 1,
        autorizadorId: estado === 'PENDIENTE' ? null : faker.datatype.number({ min: 2, max: 3 }),
      };
    });
    await prisma.pedidoEstado.createMany({
      data: pedidoEstados,
    });

    const pedidoComisiones = pedidoEstados.map((pedidoEstado) => {
      if (pedidoEstado.estado === 'APROBADO') {
        const estaCobrado = faker.datatype.boolean();
        const date = new Date(pedidoEstado.fecha);
        const cobradoAt = faker.date.soon(10, date);
        const porcentajeComision = faker.datatype.number({ min: 1, max: 20 });
        const pedido = pedidos.find((pedido) => pedido.id === pedidoEstado.pedidoId);
        const user = USER_DEV.find((user) => user.id === pedido.creadoPorId);

        return {
          monto: (pedidoEstado.montoAutorizado * porcentajeComision) / 100,
          porcentaje: porcentajeComision,
          estado: estaCobrado ? 'COBRADO' : 'NO_COBRADO',
          cobradoAt: estaCobrado ? cobradoAt : null,
          pedidoId: pedidoEstado.pedidoId,
          userId: user.comercializadoraId ?? user.id,
        };
      }
    });
    await prisma.pedidoComision.createMany({
      data: pedidoComisiones,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
