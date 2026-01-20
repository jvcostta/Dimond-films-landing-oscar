"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const cinemaImages = [
  {
    url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
    alt: "Cinema Awards",
    title: "Oscar 2026",
  },
  {
    url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    alt: "Movie Camera",
    title: "O Cinema",
  },
  {
    url: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=600&fit=crop",
    alt: "Film Reel",
    title: "A Magia dos Filmes",
  },
  {
    url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    alt: "Movie Theater",
    title: "Experiência Diamond",
  },
  {
    url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop",
    alt: "Red Carpet",
    title: "Tapete Vermelho",
  },
  {
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    alt: "Film Production",
    title: "Bastidores",
  },
  {
    url: "https://images.unsplash.com/photo-1574267432644-f610dd5e1eb0?w=800&h=600&fit=crop",
    alt: "Oscar Statue",
    title: "O Prêmio",
  },
  {
    url: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=600&fit=crop",
    alt: "Cinema Hall",
    title: "A Grande Tela",
  },
]

export function CinemaCarousel() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-16" />

        <div className="text-center mb-16 space-y-6">
          {/* Decorative line above */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
              A Essência do Cinema
            </h2>
            <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">Celebrando a sétima arte</p>
          </div>
          
          {/* Decorative line below */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
        </div>

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {cinemaImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="group relative overflow-hidden rounded-sm border border-white/10 hover:border-amber-400/50 transition-all duration-300">
                    {/* Image container */}
                    <div className="aspect-[4/3] overflow-hidden bg-black/50">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg font-light tracking-wide text-white drop-shadow-lg">{image.title}</h3>
                    </div>

                    {/* Gold accent on hover */}
                    <div className="absolute inset-0 border-2 border-amber-400/0 group-hover:border-amber-400/30 rounded-sm transition-all duration-300 pointer-events-none" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-amber-400/50 bg-black/80 hover:bg-amber-400/20 hover:border-amber-400 text-white" />
            <CarouselNext className="border-amber-400/50 bg-black/80 hover:bg-amber-400/20 hover:border-amber-400 text-white" />
          </Carousel>
        </div>

        {/* Section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mt-16" />
      </div>
    </section>
  )
}
