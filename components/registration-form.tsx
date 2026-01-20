"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Eye, EyeOff } from "lucide-react"

interface RegistrationFormProps {
  onComplete: (data: any) => void
  onBack: () => void
}

const citiesByState: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo", "União dos Palmares"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé", "Tabatinga"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro", "Ilhéus", "Itabuna", "Jequié", "Alagoinhas", "Barreiras"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Iguatu"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Cariacica", "Serra", "Cachoeiro de Itapemirim", "Linhares", "São Mateus"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade"],
  MA: ["São Luís", "Imperatriz", "Caxias", "Timon", "Codó", "Açailândia", "Bacabal", "Balsas"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Barra do Garças"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia"],
  PA: ["Belém", "Ananindeua", "Marituba", "Paragominas", "Castanhal", "Abaetetuba", "Cametá", "Bragança", "Altamira", "Santarém"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Guarabira"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Barras"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Belford Roxo", "São João de Meriti", "Petrópolis", "Volta Redonda", "Magé", "Macaé", "Itaboraí"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Açu"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Passo Fundo", "Uruguaiana"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura", "Guajará-Mirim"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Lages", "Jaraguá do Sul", "Palhoça", "Brusque", "Balneário Camboriú"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Mauá", "Santos", "Mogi das Cruzes", "Diadema", "Jundiaí", "Carapicuíba", "Piracicaba", "Bauru", "São Vicente", "Franca", "Praia Grande", "Taubaté", "Limeira", "Suzano", "Barueri", "São Caetano do Sul"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Propriá", "Estância"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins", "Guaraí"],
}

export function RegistrationForm({ onComplete, onBack }: RegistrationFormProps) {
  const { signup } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    state: "",
    city: "",
    birthDate: "",
    favoriteGenre: "",
    cinemaNetwork: "",
    consent: false,
  })

  const [showCustomGenre, setShowCustomGenre] = useState(false)
  const [showCustomCinema, setShowCustomCinema] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validações da etapa 1
    if (!formData.name.trim()) {
      setError("Nome completo é obrigatório")
      return
    }
    if (!formData.email.trim()) {
      setError("E-mail é obrigatório")
      return
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        birth_date: formData.birthDate,
        favorite_genre: formData.favoriteGenre,
        cinema_network: formData.cinemaNetwork,
      })
      // Cadastro concluído, chama onComplete
      onComplete(formData)
    } catch (err: any) {
      // Trata erro de email duplicado
      if (err.message?.includes('duplicate key') || err.message?.includes('already registered') || err.message?.includes('já está sendo usado')) {
        setError("Este email já está sendo usado por outro usuário. Por favor, use outro email ou faça login.")
      } else {
        setError(err.message || "Erro ao criar conta")
      }
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      // Limpar cidade quando o estado mudar
      if (field === "state") {
        newData.city = ""
      }
      return newData
    })
  }

  const getCitiesForState = (state: string): string[] => {
    return citiesByState[state] || []
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        {/* Back to home button */}
        <Button
          onClick={() => {
            if (step === 2) {
              setStep(1)
            } else {
              onBack()
            }
          }}
          variant="ghost"
          className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
        >
          <Home className="w-4 h-4 mr-2" />
          {step === 2 ? "Voltar" : "Voltar para início"}
        </Button>
        
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60 uppercase tracking-widest">Etapa {step} de 2</span>
            <span className="text-sm text-white/60">{step === 1 ? "50" : "100"}%</span>
          </div>
          <div className="w-full h-px bg-white/10">
            <div className={`h-full bg-linear-to-r from-amber-400/50 to-amber-400 transition-all duration-500`} style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-6 mb-12">
            {/* Decorative line above */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-[0.08em] text-white drop-shadow-2xl leading-[1.15] uppercase">
                {step === 1 ? "Cadastro Inicial" : "Informações Adicionais"}
              </h2>

              {error && (
                <div className="max-w-md mx-auto p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <p className="text-lg md:text-xl font-light text-white/70 tracking-wide">
                {step === 1 ? "Preencha seus dados básicos" : "Complete seu perfil"}
              </p>
            </div>
            
            {/* Decorative line below */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto" />
          </div>

          {/* ETAPA 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm pr-10"
                    placeholder="Digite a senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 font-semibold py-6 text-lg rounded-sm mt-8"
              >
                Continuar
              </Button>
            </form>
          )}

          {/* ETAPA 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80">
                  Telefone (WhatsApp)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white/80">
                    Estado
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateField("state", value)}
                    required
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-amber-400/50 rounded-sm">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.state && (
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white/80">
                      Cidade
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => updateField("city", value)}
                      required
                    >
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-amber-400/50 rounded-sm">
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCitiesForState(formData.state).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-white/80">
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm [color-scheme:dark]"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-white/80">
                  Gênero de filme favorito
                </Label>
                {!showCustomGenre ? (
                  <Select
                    value={formData.favoriteGenre}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setShowCustomGenre(true)
                        updateField("favoriteGenre", "")
                      } else {
                        updateField("favoriteGenre", value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-amber-400/50 rounded-sm">
                      <SelectValue placeholder="Selecione um gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ação">Ação</SelectItem>
                      <SelectItem value="Comédia">Comédia</SelectItem>
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Suspense">Suspense</SelectItem>
                      <SelectItem value="Terror">Terror</SelectItem>
                      <SelectItem value="Ficção Científica">Ficção Científica</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Animação">Animação</SelectItem>
                      <SelectItem value="custom">Outros (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      required
                      value={formData.favoriteGenre}
                      onChange={(e) => updateField("favoriteGenre", e.target.value)}
                      className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm"
                      placeholder="Digite o gênero"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowCustomGenre(false)
                        updateField("favoriteGenre", "")
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      Voltar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinema" className="text-white/80">
                  Rede de cinema que mais frequenta
                </Label>
                {!showCustomCinema ? (
                  <Select
                    value={formData.cinemaNetwork}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setShowCustomCinema(true)
                        updateField("cinemaNetwork", "")
                      } else {
                        updateField("cinemaNetwork", value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-amber-400/50 rounded-sm">
                      <SelectValue placeholder="Selecione uma rede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cinemark">Cinemark</SelectItem>
                      <SelectItem value="Cinépolis">Cinépolis</SelectItem>
                      <SelectItem value="Kinoplex">Kinoplex</SelectItem>
                      <SelectItem value="Cinesystem">Cinesystem</SelectItem>
                      <SelectItem value="UCI Cinemas">UCI Cinemas</SelectItem>
                      <SelectItem value="Cineflix">Cineflix</SelectItem>
                      <SelectItem value="Cine Araújo">Cine Araújo</SelectItem>
                      <SelectItem value="Moviecom">Moviecom</SelectItem>
                      <SelectItem value="custom">Outro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      required
                      value={formData.cinemaNetwork}
                      onChange={(e) => updateField("cinemaNetwork", e.target.value)}
                      className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/50 rounded-sm"
                      placeholder="Digite a rede de cinema"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowCustomCinema(false)
                        updateField("cinemaNetwork", "")
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      Voltar
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => updateField("consent", checked)}
                  className="border-white/20 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                  required
                />
                <Label htmlFor="consent" className="text-sm text-white/70 leading-relaxed cursor-pointer">
                  Eu concordo com o tratamento dos meus dados pessoais conforme a LGPD e autorizo o recebimento de
                  comunicações da Diamond Films.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 font-semibold py-6 text-lg rounded-sm mt-8"
                disabled={!formData.consent || isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Começar meu Bolão'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
