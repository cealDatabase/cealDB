import prisma from "../lib/prisma";

async function main() {
  const response = await Promise.all([
    await prisma.library.createMany({
      data: [
        { name: "UCB" }, 
        { name: "UCLA" }, 
        { name: "UW-Madison" }
      ],
      skipDuplicates: true,
    }),
    await prisma.user.createMany({
      data: [
        { 
        name: "Guillermo Rauch", 
        email: "rauchg@vercel.com", 
        image: "https://images.ctfassets.net/e5382hct74si/2P1iOve0LZJRZWUzfXpi9r/9d4d27765764fb1ad7379d7cbe5f1043/ucxb4lHy_400x400.jpg",
        library: {
          connectOrCreate:{
            where: {name: "UCLA"},
            create: {name: "UCLA"},
          },
        },
      }, 
      { 
        name: "Lee Robinson", 
        email: "lee@vercel.com", 
        image: "https://images.ctfassets.net/e5382hct74si/4BtM41PDNrx4z1ml643tdc/7aa88bdde8b5b7809174ea5b764c80fa/adWRdqQ6_400x400.jpg",
        library: {
          connectOrCreate:{
            where: {name: "UW-Madison"},
            create: {name: "UW-Madison"},
          },
        },
      }, 
      { 
        name: "Steven Tey", 
        email: "stey@vercel.com", 
        image: "https://images.ctfassets.net/e5382hct74si/4QEuVLNyZUg5X6X4cW4pVH/eb7cd219e21b29ae976277871cd5ca4b/profile.jpg",
        library: {
          connectOrCreate:{
            where: {name: "UCB"},
            create: {name: "UCB"},
          },
        },
      }, 
      ]})
  ]);
  console.log(response);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
