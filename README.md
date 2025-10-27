# API Backend

Este documento descreve as rotas da API backend responsáveis pela funcionalidade de geração e renderização de legendas para vídeos.

## Instalação

`powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`

`uv venv --python 3.13.9`

`.venv\Scripts\activate`

`uv sync`

## Execução

`uvicorn src.main:app`

## Visão Geral

O fluxo de legendagem no backend ocorre em duas etapas principais, expostas por duas rotas de API:

1.  **Geração de Dados (`/generate`):** O frontend envia um arquivo de vídeo. O backend processa este vídeo (transcrição com Whisper, diarização com Pyannote), mapeia os interlocutores detectados para nomes genéricos (ex: "Interlocutor 1"), salva o vídeo original e retorna os dados da legenda (texto, tempos, nomes dos interlocutores) juntamente com um identificador (caminho) para o vídeo salvo.
2.  **Renderização do Vídeo (`/render`):** O frontend, após permitir que o usuário edite os dados da legenda e as opções de estilo (cores, nomes dos interlocutores), envia essas informações (legendas editadas, estilos, identificador do vídeo original) de volta para o backend. O backend então "queima" (renderiza) essas legendas estilizadas no vídeo original e disponibiliza o vídeo final para download.

## Pré-requisitos

* O servidor backend FastAPI precisa estar rodando. Por padrão: `http://127.0.0.1:8000`.

## Base URL

Todos os endpoints descritos abaixo são relativos à base URL da API:

`http://127.0.0.1:8000/api/subtitles`

*(Nota: O host e a porta podem variar dependendo de como o backend é iniciado. Verifique o arquivo `.env` ou a saída do console do backend).*

---

## Endpoints

### 1. Gerar Dados da Legenda

* **Propósito:** Enviar um vídeo para processamento e obter os dados da legenda (texto, tempos, nomes dos interlocutores) e o caminho do arquivo salvo no servidor.
* **URL:** `/generate`
* **Método:** `POST`
* **Corpo da Requisição (`Request Body`):** `multipart/form-data`
    * **Chave (Key):** `file`
    * **Valor (Value):** O arquivo de vídeo a ser processado (ex: `meu_video.mp4`).
* **Cabeçalhos da Requisição (`Headers`):**
    * `Content-Type: multipart/form-data`
* **Resposta de Sucesso (`Success Response` - 200 OK):**
    * **Tipo:** `application/json`
    * **Estrutura:**
        ```json
        {
          "segments": [
            {
              "start": float,  // Tempo inicial do segmento em segundos (ex: 0.53)
              "end": float,    // Tempo final do segmento em segundos (ex: 2.81)
              "text": string,  // O texto transcrito para este segmento
              "speaker": string // O nome atribuído ao interlocutor (ex: "Interlocutor 1", "Interlocutor 2", "Desconhecido")
            }
            // ... mais segmentos
          ],
          "video_path": string // O caminho/identificador do vídeo salvo no backend (ex: "uploads/uuid-aleatorio.mp4"). Guarde este valor!
        }
        ```
    * **Exemplo:**
        ```json
        {
          "segments": [
            { "start": 0.0, "end": 1.84, "text": "Hoje o povo tem preconceito com funk.", "speaker": "Interlocutor 1" },
            { "start": 1.84, "end": 6.24, "text": "Você não acha daqui uns anos...", "speaker": "Interlocutor 1" },
            { "start": 6.24, "end": 8.44, "text": "Tomara, sabe quem é que tem que fazer isso?", "speaker": "Interlocutor 2" }
          ],
          "video_path": "uploads/85741736-a09a-4b8a-9b7f-857d4b58ec44.mp4"
        }
        ```
* **Possíveis Respostas de Erro (`Error Responses`):**
    * `400 Bad Request`: "Tipo de arquivo inválido. Por favor, envie um vídeo."
    * `422 Unprocessable Entity`: A chave `file` não foi encontrada no `form-data`.
    * `500 Internal Server Error`: Falha ao salvar o arquivo; Erro durante o processamento do Whisper/Pyannote. Verificar detalhes no corpo da resposta ou logs do backend.
    * `503 Service Unavailable`: Os modelos de IA não puderam ser carregados no backend.
* **Notas Importantes:**
    * Esta requisição pode demorar **bastante**. O frontend deve exibir um indicador de carregamento ("loading") e estar preparado para timeouts longos.
    * **Guarde o valor de `video_path`** retornado. Ele é essencial para a etapa de renderização.

---

### 2. Renderizar Vídeo com Legendas

* **Propósito:** Enviar os dados da legenda (editados ou não), as opções de estilo e o `video_path` (obtido na etapa anterior) para que o backend gere o vídeo final com as legendas aplicadas e o retorne para download.
* **URL:** `/render`
* **Método:** `POST`
* **Corpo da Requisição (`Request Body`):** `application/json`
    * **Estrutura:**
        ```json
        {
          "video_path": string, // O valor exato de 'video_path' retornado pela rota /generate
          "subtitles": [
            {
              "start": float,
              "end": float,
              "text": string,   // O texto (pode ter sido editado pelo usuário)
              "speaker": string // O nome do interlocutor (ex: "Interlocutor 1", "Desconhecido")
            }
            // ... lista completa de segmentos de legenda
          ],
          "styles": {
            "default": {
              "font_name": string, // Nome da fonte padrão (ex: "Arial")
              "font_size": string, // Tamanho da fonte padrão (ex: "24")
              "font_color": string // Cor hexadecimal padrão (ex: "#FFFFFF")
            },
            "speakers": {
              // Chave: O nome do interlocutor retornado por /generate (ex: "Interlocutor 1")
              "NomeDoInterlocutor": {
                "name": string,  // Novo nome para este interlocutor (editado pelo usuário, ex: "Ana")
                "color": string // Nova cor hexadecimal para este interlocutor (ex: "#FFFF00")
              }
              // ... entradas para cada interlocutor (incluindo "Desconhecido", se aplicável)
              //     que deve ter estilo/nome personalizado.
            }
          }
        }
        ```
    * **Exemplo:**
        ```json
        {
          "video_path": "uploads/85741736-a09a-4b8a-9b7f-857d4b58ec44.mp4",
          "subtitles": [
            { "start": 0.0, "end": 1.84, "text": "Texto editado aqui.", "speaker": "Interlocutor 1" },
            { "start": 1.84, "end": 6.24, "text": "Outra fala.", "speaker": "Interlocutor 1" },
            { "start": 6.24, "end": 8.44, "text": "Fala da Pessoa A.", "speaker": "Interlocutor 2" }
          ],
          "styles": {
            "default": { "font_name": "Verdana", "font_size": "22", "font_color": "#EEEEEE" },
            "speakers": {
              "Interlocutor 2": { "name": "Entrevistador", "color": "#00FF00" },
              "Interlocutor 1": { "name": "Convidado", "color": "#FFD700" }
            }
          }
        }
        ```
* **Cabeçalhos da Requisição (`Headers`):**
    * `Content-Type: application/json`
* **Resposta de Sucesso (`Success Response` - 200 OK):**
    * **Tipo:** `video/mp4`
    * **Descrição:** O corpo da resposta é o próprio arquivo de vídeo finalizado. O navegador deve iniciar o download automaticamente.
    * **Cabeçalhos da Resposta (`Headers`):**
        * `Content-Disposition: attachment; filename="video_legendado.mp4"`
* **Possíveis Respostas de Erro (`Error Responses`):**
    * `404 Not Found`: O `video_path` enviado no JSON não foi encontrado no servidor.
    * `422 Unprocessable Entity`: O JSON enviado não corresponde à estrutura esperada. Verificar detalhes no corpo da resposta.
    * `500 Internal Server Error`: Falha durante o processo de renderização do `ffmpeg`. Verificar detalhes no corpo da resposta ou logs do backend.
    * `503 Service Unavailable`: Os serviços (Subtitle ou Rendering) não puderam ser carregados.
* **Notas Importantes:**
    * Esta requisição também pode demorar. O frontend deve exibir um indicador de carregamento.
    * O vídeo original (`uploads/...`) e o vídeo renderizado (`output/...`) são **apagados** do servidor após o download ser concluído com sucesso.

---