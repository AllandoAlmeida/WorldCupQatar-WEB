import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useLocalStorage, useAsyncFn } from 'react-use'
import axios from 'axios'
import { format, formatISO } from 'date-fns'

import { Icon, Card, DateSelect} from '~/components'

export const Dashboard = () => {
    const [currentDate, setDate] = useState(formatISO(new Date(2022, 10, 20)))
    const [auth] = useLocalStorage ('auth', {})

    const [hunches, fetchHunches] = useAsyncFn(async() =>{
        const res = await axios ({
            method: 'get',
            baseURL: import.meta.env.VITE_API_URL,
            url: `/${auth.user.username}`
        })

        const hunches = res.data.reduce((acc, hunch) => {
            acc[hunch.gameId] = hunch
            return acc
        }, {})
        return hunches

    })
    const [games, fetchGames] = useAsyncFn (async(params) => {
        const res = await axios ({
            method: 'get',
            baseURL: import.meta.env.VITE_API_URL,
            url: '/games',
            params
        })

        return res.data
})

const isLoading = games.loading || hunches.loading 
const hasError = games.error || hunches.error
const isDone = !isLoading && !hasError

useEffect(() => {
    fetchHunches()
},[])

useEffect(() => {
    fetchGames({gameTime: currentDate})
    
}, [currentDate])
    
    if (!auth?.user?.id) {
        return <Navigate to= "/" replace={true} />
    }

    return (
        <>
            <header className="bg-red-500 text-white p-4">
                <div className="container max-w-3xl  flex justify-between p-4">
                    <img src="/imgs/logo_white.svg" alt="na trave" className="w-28 md:w-40"/>
                    <a href="/profile">
                        <Icon name="profile" className="w-10"/>
                    </a>
                </div>
            </header>
            <main className='space-y-6'>
                <section id="header" className="bg-red-500 text-white p-4">
                    <div className="container max-w-3xl space-y-2 ">
                        <span className=''>{auth.user.name}</span>
                        <h3 className='text-2xl font-bold'>Qual é o seu palpite?</h3>
                    </div>
                </section>

                <section id="content" className='container max-w-3xl p-4  space-y-4' >

                    <DateSelect  currentDate={currentDate} onChange={setDate}/>
                    
                    <div className='space-y-4'>
                        {isLoading && 'Carregando jogos ...'}
                        {hasError && 'Ops, acho que deu algo errado...'}

                        


                        {isDone && games.value?.map(game =>(
                            <Card 
                                key={game.id}
                                gameId={game.id}
                                homeTeam={game.homeTeam }
                                awayTeam={game.awayTeam }
                                gameTime={format(new Date(game.gameTime), 'H:mm')}
                                homeTeamScore={hunches?.value?.[game.id]?.homeTeamScore || ''}
                                awayTeamScore={hunches?.value?.[game.id]?.awayTeamScore || ''}
                                />
                            ))}
                        
                    </div>
                </section>
                

            </main>
        </>
    )
   

}