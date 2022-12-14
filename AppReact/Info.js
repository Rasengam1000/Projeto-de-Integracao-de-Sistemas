import * as React from 'react';
import { View, Text, Image, Button, BackHandler, StyleSheet } from 'react-native';
import axios from 'axios'

const wait = function (tempo) {
    return new Promise(resolve => setTimeout(resolve, tempo))
}

export default class InfoScreen extends React.Component {
    constructor(props) {
        super(props)
        this.atualizar = this.atualizar.bind(this)
        this.mudar_atualizaçao = this.mudar_atualizaçao.bind(this)
        this.state = {
            botao_atualizaçao: "Parar Atualização",
            status: "Offline",
            luminosidade_atual: 0,
            sensibilidade: 0,
            urlAPI: props.state.urlAPI,        //* IP DA API
            Axios: axios.create({
                baseURL: props.state.urlAPI        //* IP DA API
            }),
            atualizar: 1,
            //intervalo: setInterval(this.atualizar, 500),    // atualiza os dados a cada meio segundo
        }
        this.atualizar()

        this.intervalo = 500
    }

    mudar_atualizaçao() {
        if (this.intervalo == 3000) {                                  // ao conseguir se conectar apos um erro, muda o timer de volta

        }
        if (this.state.botao_atualizaçao == "Parar Atualização") {
            this.setState({
                status: "Offline",
                sensibilidade: 0,
                luminosidade_atual: 0,
                atualizar: 0
            })
            this.setState({ botao_atualizaçao: "Iniciar Atualização" })
        } else {
            this.setState({ 
                botao_atualizaçao: "Parar Atualização",
                atualizar: 1
            }, () => this.atualizar())
        }

    }

    async atualizar() {                     // funçoes enfileirando mais rapido que o fetch
        let i = 0
        console.log("entou")
        while (this.state.atualizar) {
            i += 1
            let dado_sensor
            console.log("atualizar", i)
            if (!this.state.atualizar) break        // cancelar a funçao no caso de mudança rapido do status
            try {
                const response = await fetch(`${this.state.urlAPI}/sensor`)
                dado_sensor = await response.json()
                if (!this.state.atualizar) break
            } catch (error) {
                console.log(error)
                if (this.intervalo != 3000) {
                    this.intervalo = 3000
                }
            }

            
            if (dado_sensor && this.state.atualizar) {
                if (dado_sensor.status == "Offline") {      // diminui o ritmo de requisiçoes caso API não tenha conexao com embarcado
                    this.intervalo = 3000
                } else {
                    this.intervalo = 500
                }

                this.setState({
                    status: dado_sensor.status,
                    sensibilidade: dado_sensor.sensibilidade,
                    luminosidade_atual: dado_sensor.luminosidade,
                })
            }
            await new Promise(resolve => setTimeout(resolve, this.intervalo))
            // while (this.state.atualizar && (await new Promise(resolve => setTimeout(resolve, this.intervalo))).then((result) => {
            //     return result == '' ? result ==''
            // })) {}
        }

        this.setState({
            status: "Offline",
            sensibilidade: 0,
            luminosidade_atual: 0,
        })
    }

    componentWillUnmount() {
        this.setState({})
    }

    async getHistorico() {
        let lista
        console.log("get historico")
        try {
            const response = await fetch(`${this.state.urlAPI}/sensor/historico`)
            console.log(response)
            lista = await response.json();
        } catch (error) {
            console.log(error)
            lista = 0
        }
        return lista
    }

    render() {
        const { navigate } = this.props.navigation;
        const { botao_atualizaçao, status, sensibilidade, luminosidade_atual } = this.state


        return (
            <View>
                <View style={styles.container}>
                    <Text style={styles.text}>Status Embarcado: {status}</Text>
                    <Text style={styles.text}>Sensibilidade: {sensibilidade}</Text>
                    <Text style={styles.text}>Luminosidade Atual: {luminosidade_atual}</Text>
                </View>
                <View style={styles.button}>
                    <Button title={botao_atualizaçao} onPress={() => this.mudar_atualizaçao()} />
                </View>
                <View style={styles.button}>
                    <Button title="Ver Historico de Leituras" onPress={async () => navigate('HistoricoLeituras', { lista: await this.getHistorico() })} />
                </View>
                <View style={styles.button}>
                    <Button title="Sair" onPress={() => BackHandler.exitApp()} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: 60,
    },
    text: {
        fontSize: 20,
        textAlign: "left"
    },
    title: {
        padding: 30,
        fontSize: 18,
    },
    button: {
        padding: 15
    }
});